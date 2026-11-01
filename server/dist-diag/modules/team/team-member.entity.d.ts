import { Team } from './team.entity';
import { TeamRole } from './team-roles';
import { User } from '../user/user.entity';
export declare class TeamMember {
    id: string;
    role: TeamRole;
    isAvailable: boolean;
    jerseyNumber: number;
    battingStyle: string;
    bowlingStyle: string;
    playerType: string;
    joinedAt: Date;
    updatedAt: Date;
    roleUpdatedAt: Date;
    roleUpdatedBy: string;
    teamId: string;
    team: Team;
    userId: string;
    user: User;
    isActive: boolean;
}
