import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScorerRole, TransferStatus } from '../scorer-permission.entity';

export class TransferScorerDto {
  @ApiProperty({
    description: 'User ID to transfer scoring permissions to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  transferToUserId: string;

  @ApiPropertyOptional({
    description: 'Reason for transfer',
    example: 'Need to go bat in second innings',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Role to assign to new scorer',
    example: 'primary_scorer',
    enum: ScorerRole,
  })
  @IsOptional()
  @IsEnum(ScorerRole)
  role?: ScorerRole;

  @ApiPropertyOptional({
    description: 'Whether to revoke current scorer permissions',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  revokeCurrentPermissions?: boolean;

  @ApiPropertyOptional({
    description: 'Estimated time away (in minutes)',
    example: 45,
  })
  @IsOptional()
  @Min(1)
  @Max(480)
  estimatedTimeAway?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Will take over again after batting',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Metadata for tracking',
    example: { urgency: 'high', batPosition: 3 },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AcceptScorerTransferDto {
  @ApiProperty({
    description: 'Transfer request ID to accept',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  transferRequestId: string;

  @ApiPropertyOptional({
    description: 'Acceptance notes',
    example: 'Taking over scoring duties',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether to immediately activate scoring permissions',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activateImmediately?: boolean;
}

export class RejectScorerTransferDto {
  @ApiProperty({
    description: 'Transfer request ID to reject',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  transferRequestId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Busy with other tasks',
  })
  @IsString()
  reason: string;
}

export class RevokeScorerAccessDto {
  @ApiProperty({
    description: 'User ID to revoke scoring access from',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Reason for revocation',
    example: 'Scoring duties completed',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GrantScorerAccessDto {
  @ApiProperty({
    description: 'User ID to grant scoring access to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role to assign',
    example: 'secondary_scorer',
    enum: ScorerRole,
  })
  @IsEnum(ScorerRole)
  role: ScorerRole;

  @ApiPropertyOptional({
    description: 'Reason for granting access',
    example: 'Assisting with scoring',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateScorerRoleDto {
  @ApiProperty({
    description: 'User ID to update role for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'New role to assign',
    example: 'primary_scorer',
    enum: ScorerRole,
  })
  @IsEnum(ScorerRole)
  role: ScorerRole;

  @ApiPropertyOptional({
    description: 'Reason for role change',
    example: 'Promoting to primary scorer',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
