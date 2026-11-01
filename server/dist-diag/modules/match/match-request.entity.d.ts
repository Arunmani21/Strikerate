import { Team } from '../team/team.entity';
import { Match } from './match.entity';
export declare enum MatchRequestStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class MatchRequest {
    id: string;
    matchDate: Date;
    matchTime: string;
    venue: string;
    preferredOvers: number;
    status: MatchRequestStatus;
    respondedAt: Date;
    requestingTeamId: string;
    requestingTeam: Team;
    opponentTeamId: string;
    opponentTeam: Team;
    requestedBy: string;
    respondedBy: string;
    matches: Match[];
    createdAt: Date;
}
