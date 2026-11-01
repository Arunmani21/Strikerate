import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SelectPlaying11Dto {
  @ApiProperty({
    description: 'Array of regular player IDs',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    format: 'uuid',
  })
  @IsArray({ message: 'Player IDs must be provided as an array' })
  @IsUUID('4', { each: true, message: 'Each player ID must be a valid UUID' })
  playerIds: string[];

  @ApiPropertyOptional({
    description: 'Array of guest player IDs (optional)',
    example: [
      '550e8400-e29b-41d4-a716-446655440010',
      '550e8400-e29b-41d4-a716-446655440011',
    ],
    format: 'uuid',
  })
  @IsArray({ message: 'Guest player IDs must be provided as an array' })
  @IsUUID('4', { each: true, message: 'Each guest player ID must be a valid UUID' })
  @IsOptional()
  guestPlayerIds?: string[];
}
