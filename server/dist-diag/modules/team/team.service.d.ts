import { DataSource } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class TeamService {
    private dataSource;
    constructor(dataSource: DataSource);
    createTeam(userId: string, dto: CreateTeamDto): Promise<Team>;
    getTeam(teamId: string): Promise<Team>;
    getMyTeams(userId: string): Promise<Team[]>;
    transferCaptaincy(teamId: string, currentCaptainId: string, dto: AssignRoleDto): Promise<Team>;
    assignViceCaptain(teamId: string, captainId: string, dto: AssignRoleDto): Promise<TeamMember>;
    private assignRole;
}
