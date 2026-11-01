import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TossDecision } from '../match.entity';

export class TossDto {
  @ApiProperty({
    description: 'Winning team ID (must be one of the match teams)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid team ID format' })
  tossWinnerId: string;

  @ApiProperty({
    description: 'Toss decision',
    enum: TossDecision,
    example: 'bat',
  })
  @IsEnum(TossDecision, { message: 'Invalid toss decision' })
  tossChoice: TossDecision;
}
