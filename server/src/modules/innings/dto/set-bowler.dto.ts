import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetBowlerDto {
  @ApiProperty({
    description: 'Bowler ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid bowler ID format' })
  bowlerId: string;
}
