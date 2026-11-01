import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Req,
  Res,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google.auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: `
    Create a new user account with email and password.

    **Password Requirements:**
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - No common passwords
    - No sequential characters

    **Name Requirements:**
    - 2-50 characters
    - Letters and spaces only

    **Note:** The user will automatically become the captain of any teams they create.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: '2024-03-19T10:00:00.000Z',
        },
        message: 'User registered successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    schema: {
      example: {
        success: false,
        statusCode: 409,
        message: 'An account with this email already exists',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/auth/register',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (weak password, invalid email, etc.)',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/auth/register',
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      data: user,
      message: 'User registered successfully',
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: `
    Authenticate user with email and password.

    **Returns:**
    - JWT access token (valid for 24 hours)
    - User information (without password)

    **Security Note:**
    - Generic error message prevents user enumeration
    - Password is never included in response
    - Token must be included in Authorization header for protected routes
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        message: 'Login successful',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        message: 'Invalid email or password',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/auth/login',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Please provide a valid email address',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/auth/login',
      },
    },
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      data: result,
      message: 'Login successful',
    };
  }

  /* ---- Google sign-in (web redirect + mobile idToken) ---- */

  private frontendBase(): string {
    return process.env.FRONTEND_URL || 'http://localhost:8080';
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('google')
  @ApiOperation({ summary: 'Start Google sign-in (browser redirect)' })
  async googleAuth(@Req() req: any, @Res() res: Response) {
    if (!this.googleAuthService.isConfigured()) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }
    const state = randomBytes(16).toString('hex');
    // HttpOnly + SameSite=Lax: Lax lets the cookie travel on the top-level
    // redirect back from Google, so the callback can verify the nonce.
    res.cookie('g_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 10 * 60 * 1000,
      path: '/auth',
    });
    const redirectUri = this.googleAuthService.redirectUri(req);
    return res.redirect(302, this.googleAuthService.buildAuthUrl(redirectUri, state));
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback (redirects to the SPA with a JWT fragment)' })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontend = this.frontendBase();
    const fail = () =>
      res.redirect(302, `${frontend}/auth/google/callback#google_error=1`);
    try {
      if (!this.googleAuthService.isConfigured()) {
        throw new Error('not configured');
      }
      const { code, state, error } = req.query as Record<string, string>;
      if (error || !code) return fail();

      const cookieState = (req.cookies as Record<string, string> | undefined)?.g_state;
      res.clearCookie('g_state', { path: '/auth' });
      if (!state || !cookieState || state !== cookieState) return fail();

      const redirectUri = this.googleAuthService.redirectUri(req);
      const profile = await this.googleAuthService.exchangeCode(code, redirectUri);
      const result = await this.authService.loginWithGoogleProfile(profile);
      return res.redirect(
        302,
        `${frontend}/auth/google/callback#token=${result.access_token}`,
      );
    } catch {
      return fail();
    }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('google/mobile')
  @ApiOperation({
    summary: 'Google sign-in for the Android app (idToken from the native plugin)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['idToken'],
      properties: { idToken: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Google sign-in successful' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  @ApiResponse({ status: 503, description: 'Google sign-in not configured' })
  async googleMobile(@Body() body: { idToken?: string }) {
    if (!this.googleAuthService.isConfigured()) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }
    if (!body.idToken) {
      throw new BadRequestException('idToken is required');
    }
    const profile = await this.googleAuthService.verifyIdToken(body.idToken);
    const result = await this.authService.loginWithGoogleProfile(profile);
    return {
      data: result,
      message: 'Google sign-in successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: `
    Get the authenticated user's profile information.

    **Requirements:**
    - Valid JWT token in Authorization header
    - Token must not be expired

    **Returns:**
    - Complete user profile including statistics
    - User's teams and roles
    - Password is never included
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: '2024-03-19T10:00:00.000Z',
          profile: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            role: 'allrounder',
            battingStyle: 'right_hand',
            bowlingStyle: 'right_arm_fast',
            experienceYears: 5,
            bio: 'Experienced all-rounder player',
          },
        },
        message: 'User profile retrieved successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/auth/me',
      },
    },
  })
  async getMe(@Request() req: any) {
    const user = await this.authService.getMe(req.user.userId);
    return {
      data: user,
      message: 'User profile retrieved successfully',
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email with OTP',
    description: `
    Verify email address using the OTP sent during registration.

    **Process:**
    - User provides email and 6-digit OTP
    - System validates OTP and expiry
    - Marks user email as verified
    - Sends welcome email upon successful verification

    **OTP Details:**
    - Valid for 10 minutes
    - Maximum 3 attempts
    - Case-insensitive
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'Email verified successfully',
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Doe',
            email: 'john.doe@example.com',
            emailVerified: true,
          },
        },
        timestamp: '2026-04-07T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 400,
    description: 'Maximum attempts exceeded',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  async verifyEmail(@Body() body: { email: string; otp: string }) {
    const result = await this.authService.verifyEmailOTP(body.email, body.otp);
    return {
      data: result,
      message: 'Email verification completed',
    };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP',
    description: `
    Resend OTP code to email if previous one expired or not received.

    **Note:** This invalidates the previous OTP and generates a new one.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'New OTP sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async resendOTP(@Body() body: { email: string }) {
    const result = await this.authService.resendOTP(body.email);
    return {
      data: result,
      message: 'OTP resent successfully',
    };
  }
}
