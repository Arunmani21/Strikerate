import { DataSource } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TeamPermission } from './team-roles';
import { UpdateTeamDetailsDto, UpdateMemberRoleDto, AddTeamMemberDto, RemoveTeamMemberDto, UpdateTeamAvailabilityDto, UpdatePersonalAvailabilityDto, SetCaptainDto } from './dto/team-management.dto';
export declare class TeamManagementService {
    private dataSource;
    constructor(dataSource: DataSource);
    getUserRole(teamId: string, userId: string): Promise<TeamMember | null>;
    checkPermission(teamId: string, userId: string, requiredPermission: TeamPermission): Promise<boolean>;
    updateTeamDetails(teamId: string, dto: UpdateTeamDetailsDto, userId: string): Promise<{
        team: Team;
        message: string;
    }>;
    updateMemberRole(teamId: string, targetUserId: string, dto: UpdateMemberRoleDto, userId: string): Promise<{
        teamMember: TeamMember;
        message: string;
    }>;
    addTeamMember(teamId: string, dto: AddTeamMemberDto, userId: string): Promise<{
        teamMember: TeamMember;
        message: string;
    }>;
    removeTeamMember(teamId: string, dto: RemoveTeamMemberDto, userId: string): Promise<{
        message: string;
    }>;
    setCaptain(teamId: string, dto: SetCaptainDto, userId: string): Promise<{
        message: string;
    }>;
    updateTeamAvailability(teamId: string, dto: UpdateTeamAvailabilityDto, userId: string): Promise<{
        message: string;
    }>;
    updatePersonalAvailability(teamId: string, dto: UpdatePersonalAvailabilityDto, userId: string): Promise<{
        message: string;
    }>;
    getTeamMembers(teamId: string): Promise<TeamMember[]>;
    getTeamStats(teamId: string): Promise<any>;
}
