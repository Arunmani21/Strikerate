import { IsString, IsOptional, IsEnum, IsBoolean, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RetirementReason {
  INJURY = 'injury',
  ILLNESS = 'illness',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export class RetireHurtDto {
  @ApiProperty({
    description: 'Player ID who is retiring hurt',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  playerId: string;

  @ApiProperty({
    description: 'Reason for retirement',
    example: 'injury',
    enum: RetirementReason,
  })
  @IsEnum(RetirementReason)
  reason: RetirementReason;

  @ApiPropertyOptional({
    description: 'Detailed description of the injury/issue',
    example: 'Pulled hamstring while running a quick single',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the player is expected to return later',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  expectedToReturn?: boolean;

  @ApiPropertyOptional({
    description: 'Estimated time of return (in minutes)',
    example: 30,
  })
  @IsOptional()
  @Min(1)
  estimatedReturnTime?: number;

  @ApiPropertyOptional({
    description: 'Deprecated: ignored by the server, which derives the ball number from innings state',
    example: '45.3',
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  currentBallNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Team physio attending to player',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReturnFromRetirementDto {
  @ApiProperty({
    description: 'Player ID who is returning from retirement',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  playerId: string;

  @ApiPropertyOptional({
    description: 'Deprecated: ignored by the server, which derives the ball number from innings state',
    example: '67.3',
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  ballNumber?: string;

  @ApiPropertyOptional({
    description: 'Whether player is fully fit',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  fullyFit?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about return',
    example: 'Player has recovered and is ready to bat',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubstituteFielderDto {
  @ApiProperty({
    description: 'Player ID who needs substitute',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  playerId: string;

  @ApiProperty({
    description: 'Substitute fielder ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  substitutePlayerId: string;

  @ApiPropertyOptional({
    description: 'Reason for substitution',
    example: 'injury',
    enum: RetirementReason,
  })
  @IsOptional()
  @IsEnum(RetirementReason)
  reason?: RetirementReason;

  @ApiPropertyOptional({
    description: 'Expected time away from field (in minutes)',
    example: 15,
  })
  @IsOptional()
  @Min(1)
  expectedTimeAway?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Going for treatment, will return soon',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
