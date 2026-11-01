import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { UserRole, BattingStyle, BowlingStyle } from '../../user/user-profile.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
    pattern: '^[a-zA-Z\\s]+$',
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name must contain only letters and spaces',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 50,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Primary cricket role',
    enum: UserRole,
    example: 'allrounder',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role selected' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Batting style',
    enum: BattingStyle,
    example: 'right_hand',
  })
  @IsOptional()
  @IsEnum(BattingStyle, { message: 'Invalid batting style selected' })
  battingStyle?: BattingStyle;

  @ApiPropertyOptional({
    description: 'Bowling style',
    enum: BowlingStyle,
    example: 'right_arm_fast',
  })
  @IsOptional()
  @IsEnum(BowlingStyle, { message: 'Invalid bowling style selected' })
  bowlingStyle?: BowlingStyle;

  @ApiPropertyOptional({
    description: 'Years of cricket experience',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsInt({ message: 'Experience years must be a number' })
  @Min(0, { message: 'Experience years cannot be negative' })
  @Max(50, { message: 'Experience years cannot exceed 50' })
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Short biography or description',
    example: 'Experienced all-rounder player',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;
}
