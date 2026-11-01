import { Team } from '../team/team.entity';
import { Match } from '../match/match.entity';
export declare enum GuestPlayerStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class GuestPlayer {
    id: string;
    teamId: string;
    team: Team;
    matchId: string;
    match: Match;
    name: string;
    mobile: string;
    email: string;
    status: GuestPlayerStatus;
    battingStyle: string;
    bowlingStyle: string;
    role: string;
    metadata: Record<string, any>;
    isConverted: boolean;
    convertedPlayerId: string;
    createdAt: Date;
    updatedAt: Date;
    addedBy: string;
}
