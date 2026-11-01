import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DismissalType } from '../ball.entity';

export class BallInputDto {
  @ApiProperty({
    description: 'Innings ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid innings ID format' })
  inningsId: string;

  @ApiProperty({
    description: 'Batsman ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid batsman ID format' })
  batsmanId: string;

  @ApiProperty({
    description: 'Bowler ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Invalid bowler ID format' })
  bowlerId: string;

  @ApiProperty({
    description: 'Runs scored on this ball',
    example: 4,
    minimum: 0,
    maximum: 6,
  })
  @IsInt({ message: 'Runs must be an integer' })
  @Min(0, { message: 'Runs cannot be negative' })
  @Max(6, { message: 'Maximum 6 runs per ball' })
  runs: number;

  @ApiPropertyOptional({
    description: 'Additional penalty runs on this delivery (e.g. 5-run penalty). The +1 wide/no-ball penalty is added automatically; byes/leg-byes go here only when combined with wide/no-ball.',
    example: 0,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Extra runs must be an integer' })
  @Min(0, { message: 'Extra runs cannot be negative' })
  @Max(10, { message: 'Maximum 10 extra runs' })
  extraRuns?: number;

  @ApiPropertyOptional({
    description: 'Is this a wide ball?',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isWide must be a boolean' })
  isWide?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a no ball?',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isNoBall must be a boolean' })
  isNoBall?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a bye?',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isBye must be a boolean' })
  isBye?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a leg bye?',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isLegBye must be a boolean' })
  isLegBye?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a wicket?',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isWicket must be a boolean' })
  isWicket?: boolean;

  @ApiPropertyOptional({
    description: 'Type of dismissal (if wicket)',
    enum: DismissalType,
    example: 'bowled',
  })
  @IsOptional()
  @IsEnum(DismissalType, { message: 'Invalid dismissal type' })
  wicketType?: DismissalType;

  @ApiPropertyOptional({
    description: 'Dismissed player ID (if run out)',
    example: '550e8400-e29b-41d4-a716-446655440003',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid dismissed player ID format' })
  dismissedPlayerId?: string;

  @ApiPropertyOptional({
    description: 'Ball commentary',
    example: 'Four! Through the covers',
    maxLength: 500,
  })
  @IsOptional()
  commentary?: string;
}
