import { TeamRole } from '../team-roles';
export declare class UpdateTeamDetailsDto {
    name?: string;
    homeGround?: string;
    description?: string;
    logoUrl?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateMemberRoleDto {
    role: TeamRole;
    reason?: string;
}
export declare class AddTeamMemberDto {
    userId: string;
    role: TeamRole;
    jerseyNumber?: number;
    battingStyle?: string;
    bowlingStyle?: string;
    playerType?: string;
}
export declare class RemoveTeamMemberDto {
    userId: string;
    reason?: string;
}
export declare class DeleteTeamDto {
    reason: string;
    details?: Record<string, any>;
}
export declare class UpdateTeamAvailabilityDto {
    matchId: string;
    isAvailable: boolean;
    notes?: string;
    lineupStrength?: string;
    details?: Record<string, any>;
}
export declare class UpdatePersonalAvailabilityDto {
    matchId: string;
    isAvailable: boolean;
    reason?: string;
    details?: Record<string, any>;
}
export declare class SetCaptainDto {
    captainId: string;
    viceCaptainId?: string;
}
