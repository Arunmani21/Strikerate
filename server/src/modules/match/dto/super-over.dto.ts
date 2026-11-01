import { IsString, IsUUID, IsEnum, IsNumber, Min, Max, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuperOverType, SuperOverStatus } from '../super-over.entity';

export class SuperOverDecisionDto {
  @ApiProperty({
    description: 'Decision: Draw or Super Over',
    example: 'super_over',
    enum: ['draw', 'super_over'],
  })
  @IsEnum(['draw', 'super_over'])
  decision: 'draw' | 'super_over';

  @ApiPropertyOptional({
    description: 'Reason for decision',
    example: 'Teams agreed to play super over to determine winner',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: { tournamentRules: 'ICC Super Over Rules apply', reserveDayAvailable: false },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class StartSuperOverDto {
  @ApiProperty({
    description: 'Super Over type',
    example: 'standard',
    enum: SuperOverType,
  })
  @IsEnum(SuperOverType)
  type: SuperOverType;

  @ApiPropertyOptional({
    description: 'Team that won the toss',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  tossWinnerTeamId: string;

  @ApiPropertyOptional({
    description: 'Toss decision',
    example: 'bat',
    enum: ['bat', 'bowl'],
  })
  @IsOptional()
  @IsEnum(['bat', 'bowl'])
  tossChoice?: string;

  @ApiPropertyOptional({
    description: 'Target runs (if applicable)',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  targetRuns?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Super over to decide winner of tied match',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { matchContext: 'India vs Australia, T20 World Cup final' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SuperOverBallDto {
  @ApiProperty({
    description: 'Super Over ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  superOverId: string;

  @ApiProperty({
    description: 'Batsman ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  batsmanId: string;

  @ApiProperty({
    description: 'Bowler ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  bowlerId: string;

  @ApiProperty({
    description: 'Runs scored on this ball',
    example: 2,
    minimum: 0,
    maximum: 6,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  runs: number;

  @ApiPropertyOptional({
    description: 'Is this a wide ball?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isWide?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a no ball?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isNoBall?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a bye ball?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBye?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a leg bye?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isLegBye?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a wicket?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isWicket?: boolean;

  @ApiPropertyOptional({
    description: 'Wicket type (if wicket)',
    example: 'bowled',
  })
  @IsOptional()
  @IsString()
  wicketType?: string;

  @ApiPropertyOptional({
    description: 'Dismissed player ID (if run out)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  dismissedPlayerId?: string;

  @ApiPropertyOptional({
    description: 'Ball commentary',
    example: 'FOUR! Through the covers for boundary',
  })
  @IsOptional()
  @IsString()
  commentary?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { over: 1, ball: 3, matchSituation: 'India needs 3 runs to win' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CompleteSuperOverDto {
  @ApiProperty({
    description: 'Winning team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  winningTeamId: string;

  @ApiProperty({
    description: 'Margin of victory',
    example: '2 runs',
  })
  @IsString()
  margin: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { superOverNumber: 1, endedBy: 'wickets', ballsFaced: 8 },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class AbandonSuperOverDto {
  @ApiProperty({
    description: 'Reason for abandonment',
    example: 'rain',
  })
  @IsEnum(['rain', 'bad_light', 'injury', 'equipment', 'crowd', 'other'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Detailed explanation',
    example: 'Persistent rain made super over impossible',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Match situation at abandonment',
    example: { teamA: { runs: 15, wickets: 1 }, teamB: { runs: 12, wickets: 0 } },
  })
  @IsOptional()
  @IsObject()
  matchSituation?: Record<string, any>;
}

export class SuperOverStatusDto {
  @ApiProperty({
    description: 'New super over status',
    example: 'in_progress',
    enum: SuperOverStatus,
  })
  @IsEnum(SuperOverStatus)
  status: SuperOverStatus;

  @ApiPropertyOptional({
    description: 'Status change reason',
    example: 'Super over completed - Team A won by 2 runs',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
