import {
  IsDateString,
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  MaxLength,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatchRequestDto {
  @ApiProperty({
    description: 'Opponent team ID to send request to',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid opponent team ID format' })
  opponentTeamId: string;

  @ApiProperty({
    description: 'Preferred match date (YYYY-MM-DD format)',
    example: '2024-03-25',
  })
  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  matchDate: string;

  @ApiProperty({
    description: 'Preferred match time (HH:MM format)',
    example: '14:30',
  })
  @IsString()
  matchTime: string;

  @ApiPropertyOptional({
    description: 'Preferred venue',
    example: 'Mumbai Cricket Ground',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Venue must not exceed 200 characters' })
  venue?: string;

  @ApiPropertyOptional({
    description: 'Preferred match format (overs)',
    example: 20,
    minimum: 5,
    maximum: 50,
  })
  @IsOptional()
  @IsInt({ message: 'Preferred overs must be an integer' })
  @Min(5, { message: 'Minimum 5 overs' })
  @Max(50, { message: 'Maximum 50 overs' })
  preferredOvers?: number;
}

export class RespondRequestDto {
  @ApiProperty({
    description: 'Response to match request',
    enum: ['confirmed', 'rejected'],
    example: 'confirmed',
  })
  @IsIn(['confirmed', 'rejected'], {
    message: 'Status must be either confirmed or rejected',
  })
  status: 'confirmed' | 'rejected';
}
