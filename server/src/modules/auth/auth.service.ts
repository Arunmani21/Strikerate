import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { UserProfile } from '../user/user-profile.entity';
import { OtpType } from './otp.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import type { GoogleProfilePayload } from './google.auth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  /**
   * Register user with automatic OTP sending
   */
  async register(dto: RegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);

      // Trim input values
      const trimmedName = dto.name.trim();
      const trimmedEmail = dto.email.trim().toLowerCase();

      // Validate trimmed values
      if (trimmedName !== dto.name || trimmedEmail !== dto.email) {
        throw new BadRequestException(
          'Name and email should not have leading/trailing spaces',
        );
      }

      // Check email unique
      const existingUser = await userRepository.findOne({
        where: { email: trimmedEmail },
      });

      if (existingUser) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      // Validate password strength
      this.validatePasswordStrength(dto.password);

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user (not email verified)
      const user = userRepository.create({
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        emailVerified: false,
      });

      const savedUser = await userRepository.save(user);

      // Create user profile
      const profile = profileRepository.create({
        userId: savedUser.id,
        role: dto.role,
        battingStyle: dto.battingStyle,
        bowlingStyle: dto.bowlingStyle,
        experienceYears: dto.experienceYears,
        bio: dto.bio?.trim(),
      });

      await profileRepository.save(profile);

      await queryRunner.commitTransaction();

      // Send OTP for email verification (don't block registration)
      this.otpService.generateEmailOtp(savedUser.email, savedUser.id).catch(err => {
        console.error('Failed to send OTP email:', err.message);
      });

      // Return user without password
      const { password, ...userWithoutPassword } = savedUser;
      return {
        ...userWithoutPassword,
        message: 'Registration successful. Please verify your email to activate your account.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const userRepository = this.dataSource.getRepository(User);

    // Trim input values
    const trimmedEmail = dto.email.trim().toLowerCase();

    // Validate trimmed email
    if (trimmedEmail !== dto.email.trim()) {
      throw new BadRequestException('Email should not have leading/trailing spaces');
    }

    const user = await userRepository.findOne({
      where: { email: trimmedEmail },
    });

    // Generic error message to prevent user enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Google-only accounts have no password hash to compare against
    if (user.password == null) {
      throw new UnauthorizedException(
        'This account was created with Google Sign-In. Please continue with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  /**
   * Google sign-in (web callback + mobile idToken share this).
   * Link order: by googleId, then by verified email, else create the account.
   * Google emails are verified by Google, so these accounts skip OTP entirely.
   */
  async loginWithGoogleProfile(payload: GoogleProfilePayload) {
    if (!payload.emailVerified) {
      throw new UnauthorizedException(
        'Your Google account email is not verified. Verify it at Google and try again.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);

      let user = await userRepository.findOne({
        where: { googleId: payload.googleId },
      });

      if (!user) {
        const byEmail = await userRepository.findOne({
          where: { email: payload.email },
        });

        if (byEmail) {
          // Same verified email → link the Google identity to that account.
          byEmail.googleId = payload.googleId;
          byEmail.emailVerified = true;
          byEmail.emailVerifiedAt ??= new Date();
          user = await userRepository.save(byEmail);
        } else {
          user = await userRepository.save(
            userRepository.create({
              name: payload.name,
              email: payload.email,
              password: null,
              googleId: payload.googleId,
              emailVerified: true,
              emailVerifiedAt: new Date(),
            }),
          );
          await profileRepository.save(
            profileRepository.create({ userId: user.id }),
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.issueToken(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private issueToken(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    };
  }

  async getMe(userId: string) {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Verify email with OTP
   */
  async verifyEmailOTP(email: string, otp: string): Promise<{ success: boolean; message: string; user?: any }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);

      // Verify OTP
      const otpResult = await this.otpService.verifyOtp(email, otp, OtpType.EMAIL_VERIFICATION);

      if (!otpResult.success) {
        await queryRunner.rollbackTransaction();
        return otpResult;
      }

      // Update user as email verified
      const user = await userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await userRepository.save(user);

      await queryRunner.commitTransaction();

      // Send welcome email
      this.emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error('Failed to send welcome email:', err.message);
      });

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Email verified successfully',
        user: userWithoutPassword,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    return this.otpService.resendOtp(email, OtpType.EMAIL_VERIFICATION);
  }

  private validatePasswordStrength(password: string): void {
    // Additional server-side password validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      );
    }

    // Check for common passwords
    const commonPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty123',
      'abc12345',
      'letmein',
      'welcome1',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new BadRequestException(
        'Please choose a stronger password. This password is too common.',
      );
    }

    // Check for sequences
    const hasSequence = /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);

    if (hasSequence) {
      throw new BadRequestException(
        'Password should not contain common sequences like "123" or "abc"',
      );
    }

    // Check for repeated characters
    const hasRepeatedChars = /(.)\1{2,}/.test(password);
    if (hasRepeatedChars) {
      throw new BadRequestException(
        'Password should not contain repeated characters',
      );
    }
  }
}
