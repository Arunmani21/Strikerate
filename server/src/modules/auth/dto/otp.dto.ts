import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Email address or mobile number',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'OTP type',
    enum: ['email_verification', 'mobile_verification', 'password_reset'],
    example: 'email_verification',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address or mobile number',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'OTP must be 6 digits' })
  otp: string;

  @ApiProperty({
    description: 'OTP type',
    enum: ['email_verification', 'mobile_verification', 'password_reset'],
    example: 'email_verification',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'Email address or mobile number',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'OTP type',
    enum: ['email_verification', 'mobile_verification'],
    example: 'email_verification',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class VerifyMobileDto {
  @ApiProperty({
    description: 'Mobile number',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  mobile: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'OTP must be 6 digits' })
  otp: string;
}