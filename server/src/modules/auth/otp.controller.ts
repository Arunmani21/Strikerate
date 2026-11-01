import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';

@ApiTags('OTP Verification')
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('send')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP for verification',
    description: `
    Send a One-Time Password (OTP) to email or mobile for verification.

    **Use Cases:**
    - Email verification after registration
    - Mobile number verification
    - Password reset requests

    **Parameters:**
    - identifier: Email address or mobile number
    - type: Type of OTP (email_verification, mobile_verification, password_reset)

    **OTP Details:**
    - 6-digit numeric code
    - Valid for 10 minutes
    - Maximum 3 attempts
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'OTP sent successfully to your email',
        },
        timestamp: '2026-04-07T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid identifier',
  })
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() dto: SendOtpDto) {
    const identifier = dto.identifier.trim();

    // Determine if email or mobile
    const isEmail = identifier.includes('@');

    if (!isEmail) {
      // Mobile OTP
      return this.otpService.generateMobileOtp(identifier);
    } else {
      // Email OTP
      return this.otpService.generateEmailOtp(identifier);
    }
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code',
    description: `
    Verify the OTP code sent to email or mobile.

    **Process:**
    - Validates OTP code
    - Checks expiration (10 minutes)
    - Tracks attempts (max 3)
    - Marks as verified on success

    **Security:**
    - OTP case-insensitive
    - Automatic expiry after max attempts
    - Time-based expiration
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'OTP verified successfully',
          userId: 'user-uuid-here',
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
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const identifier = dto.identifier.trim();
    const otpType = dto.type || 'email_verification';

    return this.otpService.verifyOtp(identifier, dto.otp, otpType as any);
  }

  @Post('resend')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP',
    description: `
    Resend OTP if the previous one expired or user didn't receive it.

    **Note:** A new OTP will be generated and the previous one will be invalidated.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'New OTP sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No previous OTP found',
  })
  @ApiBody({ type: ResendOtpDto })
  async resendOtp(@Body() dto: ResendOtpDto) {
    const identifier = dto.identifier.trim();
    const otpType = dto.type || 'email_verification';

    return this.otpService.resendOtp(identifier, otpType as any);
  }
}
