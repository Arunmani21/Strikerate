import { TeamManagementService } from './team-management.service';
import { UpdateTeamDetailsDto, UpdateMemberRoleDto, AddTeamMemberDto, RemoveTeamMemberDto, UpdateTeamAvailabilityDto, UpdatePersonalAvailabilityDto, SetCaptainDto } from './dto/team-management.dto';
export declare class TeamManagementController {
    private readonly teamManagementService;
    constructor(teamManagementService: TeamManagementService);
    updateTeamDetails(teamId: string, updateTeamDetailsDto: UpdateTeamDetailsDto, req: any): Promise<{
        team: import("./team.entity").Team;
        message: string;
    }>;
    updateMemberRole(teamId: string, userId: string, updateMemberRoleDto: UpdateMemberRoleDto, req: any): Promise<{
        teamMember: import("./team-member.entity").TeamMember;
        message: string;
    }>;
    addTeamMember(teamId: string, addTeamMemberDto: AddTeamMemberDto, req: any): Promise<{
        teamMember: import("./team-member.entity").TeamMember;
        message: string;
    }>;
    removeTeamMember(teamId: string, removeTeamMemberDto: RemoveTeamMemberDto, req: any): Promise<{
        message: string;
    }>;
    setCaptain(teamId: string, setCaptainDto: SetCaptainDto, req: any): Promise<{
        message: string;
    }>;
    updateTeamAvailability(teamId: string, updateTeamAvailabilityDto: UpdateTeamAvailabilityDto, req: any): Promise<{
        message: string;
    }>;
    updatePersonalAvailability(teamId: string, updatePersonalAvailabilityDto: UpdatePersonalAvailabilityDto, req: any): Promise<{
        message: string;
    }>;
    getTeamMembers(teamId: string): Promise<import("./team-member.entity").TeamMember[]>;
    getTeamStats(teamId: string): Promise<any>;
    getMyRole(teamId: string, req: any): Promise<{
        role: any;
        isMember: boolean;
        message: string;
        joinedAt?: undefined;
        permissions?: undefined;
    } | {
        role: import("./team-roles").TeamRole;
        isMember: boolean;
        joinedAt: Date;
        permissions: string[];
        message?: undefined;
    }>;
    private getPermissionsForRole;
}
