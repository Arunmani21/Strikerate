import {
  IsDateString,
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeamAvailabilityDto {
  @ApiProperty({
    description: 'Date available for match (YYYY-MM-DD format)',
    example: '2024-03-25',
  })
  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  availableDate: string;

  @ApiProperty({
    description: 'Available from time (HH:MM format)',
    example: '09:00',
  })
  @IsString()
  availableFrom: string;

  @ApiProperty({
    description: 'Available until time (HH:MM format)',
    example: '18:00',
  })
  @IsString()
  availableUntil: string;

  @ApiPropertyOptional({
    description: 'Preferred venue for matches',
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

  @ApiPropertyOptional({
    description: 'Additional notes or requirements',
    example: 'Looking for T20 match on weekend',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether open to receiving match requests',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_open must be a boolean value' })
  isOpen?: boolean;
}
