import {
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlayerAvailabilityDto {
  @ApiProperty({
    description: 'Date for availability (YYYY-MM-DD format)',
    example: '2024-03-20',
  })
  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  availableDate: string;

  @ApiPropertyOptional({
    description: 'Whether the player is available on this date',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean value' })
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for unavailability (if not available)',
    example: 'Injured - knee injury',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export class UpdatePlayerAvailabilityDto {
  @ApiProperty({
    description: 'Player ID to update availability for',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid player ID format' })
  playerId: string;

  @ApiProperty({
    description: 'Date for availability (YYYY-MM-DD format)',
    example: '2024-03-20',
  })
  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  availableDate: string;

  @ApiPropertyOptional({
    description: 'Whether the player is available on this date',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean value' })
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for unavailability (if not available)',
    example: 'Family commitment',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}
