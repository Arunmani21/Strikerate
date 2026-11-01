import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, MaxLength, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamRole } from '../team-roles';

/**
 * DTO for updating team details
 * Only OWNER and ADMIN can update team details
 */
export class UpdateTeamDetailsDto {
  @ApiPropertyOptional({
    description: 'Team name',
    example: 'Mumbai Indians',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Home ground/venue',
    example: 'Wankhede Stadium',
  })
  @IsOptional()
  @IsString()
  homeGround?: string;

  @ApiPropertyOptional({
    description: 'Team description',
    example: 'Five-time IPL champions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Team logo URL',
    example: 'https://example.com/logos/mi.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional team metadata',
    example: { foundedYear: 2008, owner: 'Reliance Industries' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO for updating team member role
 * Only OWNER and ADMIN can update member roles
 */
export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'New role for the team member',
    enum: TeamRole,
    example: TeamRole.CAPTAIN,
  })
  @IsEnum(TeamRole)
  role: TeamRole;

  @ApiPropertyOptional({
    description: 'Reason for role change',
    example: 'Promoted to captain due to leadership skills',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for adding member to team
 * Only OWNER and ADMIN can add members
 */
export class AddTeamMemberDto {
  @ApiProperty({
    description: 'User ID to add to team',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role for the new member',
    enum: TeamRole,
    example: TeamRole.PLAYER,
    default: TeamRole.PLAYER,
  })
  @IsEnum(TeamRole)
  role: TeamRole;

  @ApiPropertyOptional({
    description: 'Jersey number',
    example: 10,
    minimum: 1,
    maximum: 999,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999)
  jerseyNumber?: number;

  @ApiPropertyOptional({
    description: 'Batting style',
    example: 'right-handed',
  })
  @IsOptional()
  @IsString()
  battingStyle?: string;

  @ApiPropertyOptional({
    description: 'Bowling style',
    example: 'right-arm fast',
  })
  @IsOptional()
  @IsString()
  bowlingStyle?: string;

  @ApiPropertyOptional({
    description: 'Player type',
    example: 'all-rounder',
  })
  @IsOptional()
  @IsString()
  playerType?: string;
}

/**
 * DTO for removing member from team
 * Only OWNER and ADMIN can remove members
 */
export class RemoveTeamMemberDto {
  @ApiProperty({
    description: 'User ID to remove from team',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Reason for removal',
    example: 'Player requested to leave the team',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for team soft delete
 * Only OWNER can delete team
 */
export class DeleteTeamDto {
  @ApiProperty({
    description: 'Reason for deletion',
    example: 'Team disbanded',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { disbandedDate: '2026-04-08', membersNotified: true },
  })
  @IsOptional()
  details?: Record<string, any>;
}

/**
 * DTO for updating team availability
 * CAPTAIN, VICE_CAPTAIN can set team availability
 * All members can update their own availability
 */
export class UpdateTeamAvailabilityDto {
  @ApiProperty({
    description: 'Match ID for which availability is being set',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  matchId: string;

  @ApiProperty({
    description: 'Is the team available for this match?',
    example: true,
  })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Availability notes',
    example: 'All key players available',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Expected lineup strength',
    example: 'full-strength',
    enum: ['full-strength', 'weakened', 'experimental', 'mixed'],
  })
  @IsOptional()
  @IsString()
  lineupStrength?: string;

  @ApiPropertyOptional({
    description: 'Additional availability details',
    example: { keyPlayersAvailable: 11, injuries: 0 },
  })
  @IsOptional()
  details?: Record<string, any>;
}

/**
 * DTO for updating personal availability
 * All members can update their own availability
 */
export class UpdatePersonalAvailabilityDto {
  @ApiProperty({
    description: 'Match ID for which availability is being set',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  matchId: string;

  @ApiProperty({
    description: 'Is the player available for this match?',
    example: true,
  })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Reason for unavailability',
    example: 'Work commitment',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional details',
    example: { availableFrom: '2026-04-10', availableUntil: '2026-04-15' },
  })
  @IsOptional()
  details?: Record<string, any>;
}

/**
 * DTO for setting captain and vice-captain
 * Only OWNER and ADMIN can set captain/vice-captain
 */
export class SetCaptainDto {
  @ApiProperty({
    description: 'Captain user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  captainId: string;

  @ApiPropertyOptional({
    description: 'Vice-captain user ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  viceCaptainId?: string;
}
