import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Otp, OtpType, OtpStatus } from './otp.entity';
import { EmailService } from './email.service';
import { generateOtp, isOtpExpired } from '../utils/otp.utils';

@Injectable()
export class OtpService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private emailService: EmailService,
  ) {}

  /**
   * Generate and send OTP for email verification
   */
  async generateEmailOtp(email: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const otpRepository = queryRunner.manager.getRepository(Otp);

      // Invalidate any existing pending OTPs for this email
      await otpRepository.update(
        { email, status: OtpStatus.PENDING },
        { status: OtpStatus.EXPIRED }
      );

      // Generate 6-digit OTP
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create OTP record
      const otp = otpRepository.create({
        email,
        userId,
        otp: otpCode,
        type: OtpType.EMAIL_VERIFICATION,
        status: OtpStatus.PENDING,
        expiresAt,
      });

      await otpRepository.save(otp);

      await queryRunner.commitTransaction();

      // Send OTP email
      await this.emailService.sendOtpEmail(email, otpCode);

      return {
        success: true,
        message: 'OTP sent successfully to your email',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate and send OTP for mobile verification
   */
  async generateMobileOtp(mobile: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const otpRepository = queryRunner.manager.getRepository(Otp);

      // Invalidate any existing pending OTPs for this mobile
      await otpRepository.update(
        { mobile, status: OtpStatus.PENDING },
        { status: OtpStatus.EXPIRED }
      );

      // Generate 6-digit OTP
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create OTP record
      const otp = otpRepository.create({
        mobile,
        userId,
        otp: otpCode,
        type: OtpType.MOBILE_VERIFICATION,
        status: OtpStatus.PENDING,
        expiresAt,
      });

      await otpRepository.save(otp);

      await queryRunner.commitTransaction();

      // TODO: Integrate with SMS service
      // await this.smsService.sendOtpSms(mobile, otpCode);

      return {
        success: true,
        message: 'OTP sent successfully to your mobile',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(
    identifier: string,
    otpCode: string,
    type: OtpType = OtpType.EMAIL_VERIFICATION,
  ): Promise<{ success: boolean; message: string; userId?: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const otpRepository = queryRunner.manager.getRepository(Otp);

      // Find the OTP (by email or mobile)
      const otp = await otpRepository.findOne({
        where: [
          { email: identifier, otp: otpCode, type, status: OtpStatus.PENDING },
          { mobile: identifier, otp: otpCode, type, status: OtpStatus.PENDING },
        ],
        order: { createdAt: 'DESC' },
      });

      if (!otp) {
        // Update attempts on any matching pending OTPs to prevent brute force
        await otpRepository.update(
          [
            { email: identifier, type, status: OtpStatus.PENDING },
            { mobile: identifier, type, status: OtpStatus.PENDING },
          ],
          { attempts: () => 'attempts + 1' }
        );

        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // Check if OTP is expired
      if (isOtpExpired(otp.expiresAt)) {
        otp.status = OtpStatus.EXPIRED;
        await otpRepository.save(otp);
        await queryRunner.commitTransaction();
        throw new UnauthorizedException('OTP has expired. Please request a new one.');
      }

      // Check max attempts
      if (otp.attempts >= otp.maxAttempts) {
        otp.status = OtpStatus.EXPIRED;
        await otpRepository.save(otp);
        await queryRunner.commitTransaction();
        throw new BadRequestException('Maximum OTP attempts exceeded. Please request a new one.');
      }

      // Increment attempts
      otp.attempts += 1;

      // Check if OTP matches (case-insensitive)
      if (otp.otp.toLowerCase() !== otpCode.toLowerCase()) {
        await otpRepository.save(otp);
        await queryRunner.commitTransaction();

        const remainingAttempts = otp.maxAttempts - otp.attempts;
        throw new UnauthorizedException(
          `Invalid OTP. ${remainingAttempts} attempts remaining.`
        );
      }

      // OTP is valid - mark as verified
      otp.status = OtpStatus.VERIFIED;
      otp.verifiedAt = new Date();
      await otpRepository.save(otp);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'OTP verified successfully',
        userId: otp.userId,
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
  async resendOtp(
    identifier: string,
    type: OtpType = OtpType.EMAIL_VERIFICATION,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const otpRepository = queryRunner.manager.getRepository(Otp);

      // Find recent OTP to get userId
      const recentOtp = await otpRepository.findOne({
        where: [
          { email: identifier, type },
          { mobile: identifier, type },
        ],
        order: { createdAt: 'DESC' },
      });

      if (!recentOtp) {
        throw new NotFoundException('No previous OTP found. Please register first.');
      }

      // Generate new OTP
      if (type === OtpType.EMAIL_VERIFICATION) {
        await this.generateEmailOtp(identifier, recentOtp.userId);
      } else if (type === OtpType.MOBILE_VERIFICATION) {
        await this.generateMobileOtp(identifier, recentOtp.userId);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'New OTP sent successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Clean up expired OTPs (should be run periodically)
   */
  async cleanupExpiredOtps(): Promise<void> {
    const otpRepository = this.dataSource.getRepository(Otp);

    const now = new Date();
    await otpRepository
      .createQueryBuilder()
      .update()
      .set({ status: OtpStatus.EXPIRED })
      .where('expiresAt < :now', { now })
      .andWhere('status = :pending', { pending: OtpStatus.PENDING })
      .execute();
  }
}