import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetBatsmenDto {
  @ApiProperty({
    description: 'Striker batsman ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid striker ID format' })
  strikerId: string;

  @ApiProperty({
    description: 'Non-striker batsman ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid non-striker ID format' })
  nonStrikerId: string;
}
