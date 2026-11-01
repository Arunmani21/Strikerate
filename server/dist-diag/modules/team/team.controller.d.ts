import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class TeamController {
    private teamService;
    constructor(teamService: TeamService);
    createTeam(req: any, dto: CreateTeamDto): Promise<{
        data: import("./team.entity").Team;
        message: string;
    }>;
    getMyTeams(req: any): Promise<{
        data: import("./team.entity").Team[];
        message: string;
    }>;
    getTeam(id: string): Promise<{
        data: import("./team.entity").Team;
        message: string;
    }>;
    transferCaptaincy(id: string, req: any, dto: AssignRoleDto): Promise<{
        data: import("./team.entity").Team;
        message: string;
    }>;
    assignViceCaptain(id: string, req: any, dto: AssignRoleDto): Promise<{
        data: import("./team-member.entity").TeamMember;
        message: string;
    }>;
}
