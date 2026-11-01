import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartInningsDto {
  @ApiProperty({
    description: 'Batting team ID (must be one of the match teams)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid batting team ID format' })
  battingTeamId: string;

  @ApiProperty({
    description: 'Bowling team ID (must be the other team)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid bowling team ID format' })
  bowlingTeamId: string;

  @ApiProperty({
    description: 'Innings number',
    example: 1,
    enum: [1, 2],
  })
  @IsEnum([1, 2], { message: 'Innings number must be 1 or 2' })
  inningsNumber: number;
}
