import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { UserRole, BattingStyle, BowlingStyle } from '../user-profile.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
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
