import { IsEnum, IsUUID, IsString, IsOptional, IsNumber, IsBoolean, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({
    description: 'New match status',
    enum: MatchStatus,
    example: MatchStatus.LIVE,
  })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'Match started on time',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Winning team ID (for completed matches)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  winningTeamId?: string;

  @ApiPropertyOptional({
    description: 'Margin of victory',
    example: '5 wickets',
  })
  @IsOptional()
  @IsString()
  marginOfVictory?: string;

  @ApiPropertyOptional({
    description: 'Type of margin (runs, wickets)',
    example: 'wickets',
  })
  @IsOptional()
  @IsString()
  marginType?: string;

  @ApiPropertyOptional({
    description: 'Additional details about status change',
    example: { weather: 'Rain stopped play', oversRemaining: 15 },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Weather conditions at time of status change',
    example: 'Heavy rain, water on outfield',
  })
  @IsOptional()
  @IsString()
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Overs bowled so far (for abandoned matches)',
    example: 35.4,
  })
  @IsOptional()
  @IsNumber()
  oversBowled?: number;

  @ApiPropertyOptional({
    description: 'Total overs that were to be bowled',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  totalOversBowled?: number;
}

export class AbandonMatchDto {
  @ApiProperty({
    description: 'Reason for abandonment',
    example: 'rain',
  })
  @IsEnum(['rain', 'bad_light', 'pitch_conditions', 'crowd_trouble', 'security', 'other'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Detailed explanation',
    example: 'Persistent heavy rain made the field unplayable',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Weather conditions',
    example: 'Heavy rain, water on outfield, covers ineffective',
  })
  @IsOptional()
  @IsString()
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Overs bowled before abandonment',
    example: 35.4,
  })
  @IsOptional()
  @IsNumber()
  oversBowled?: number;

  @ApiPropertyOptional({
    description: 'Total overs scheduled',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  totalOvers?: number;

  @ApiPropertyOptional({
    description: 'Match can be resumed later',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  canBeResumed?: boolean;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: { rainStarted: '14:30', estimatedClearTime: '18:00' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CompleteMatchDto {
  @ApiProperty({
    description: 'Winning team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  winningTeamId: string;

  @ApiProperty({
    description: 'Type of victory',
    example: 'runs',
  })
  @IsEnum(['runs', 'wickets', 'innings', 'forfeit'])
  victoryType: string;

  @ApiProperty({
    description: 'Margin of victory',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  margin: number;

  @ApiPropertyOptional({
    description: 'Result description',
    example: 'India won by 5 wickets',
  })
  @IsOptional()
  @IsString()
  resultDescription?: string;
}

export class DeclareMatchTiedDto {
  @ApiPropertyOptional({
    description: 'Tie description',
    example: 'Both teams scored 250 runs',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { superOver: 'India won super over' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class DeclareMatchDrawDto {
  @ApiPropertyOptional({
    description: 'Draw description',
    example: 'Match ended in a draw after 5 days',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Reason for draw',
    example: 'Time ran out, both teams agreed to draw',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { innings: { teamA: 4, teamB: 4 }, days: 5 },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class DelayMatchDto {
  @ApiProperty({
    description: 'Type of delay',
    enum: ['rain', 'bad_light'],
    example: 'rain',
  })
  @IsEnum(['rain', 'bad_light'])
  delayType: 'rain' | 'bad_light';

  @ApiProperty({
    description: 'Estimated delay duration (in minutes)',
    example: 45,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiPropertyOptional({
    description: 'Delay description',
    example: 'Heavy rain, covers on',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Weather conditions',
    example: 'Heavy rain with strong winds',
  })
  @IsOptional()
  @IsString()
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Current match situation',
    example: { overs: 25.4, score: { teamA: 145, teamB: 132 } },
  })
  @IsOptional()
  @IsObject()
  matchSituation?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Expected resumption time',
    example: '16:30',
  })
  @IsOptional()
  @IsString()
  expectedResumption?: string;
}

export class ResumeMatchDto {
  @ApiPropertyOptional({
    description: 'Resumption description',
    example: 'Play resumed after rain delay',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Time lost (in minutes)',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLost?: number;

  @ApiPropertyOptional({
    description: 'Overs reduced (if any)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  oversReduced?: number;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { revisedOvers: 45, newSessionTime: '16:45' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class PostponeMatchDto {
  @ApiProperty({
    description: 'Reason for postponement',
    example: 'Unplayable weather conditions',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Rescheduled date',
    example: '2026-04-15',
  })
  @IsString()
  rescheduledDate: string;

  @ApiProperty({
    description: 'Rescheduled time',
    example: '14:30',
  })
  @IsString()
  rescheduledTime: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: { originalDate: '2026-04-08', venue: 'Same ground' },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class CancelMatchDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Venue unavailable',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
