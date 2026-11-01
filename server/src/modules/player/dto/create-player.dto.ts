import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Player full name',
    example: 'Virat Kohli',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Player name must be at least 2 characters' })
  @MaxLength(100, { message: 'Player name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Jersey number (optional)',
    example: 18,
    minimum: 0,
    maximum: 999,
  })
  @IsOptional()
  @IsInt({ message: 'Jersey number must be an integer' })
  @Min(0, { message: 'Jersey number cannot be negative' })
  @Max(999, { message: 'Jersey number cannot exceed 999' })
  jerseyNumber?: number;

  @ApiPropertyOptional({
    description: 'Link to existing user account (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId?: string;
}
