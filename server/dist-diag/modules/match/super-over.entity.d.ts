import { Match } from './match.entity';
import { Team } from '../team/team.entity';
export declare enum SuperOverStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ABANDONED = "abandoned"
}
export declare enum SuperOverType {
    STANDARD = "standard",
    TIE_BREAKER = "tie_breaker"
}
export declare class SuperOver {
    id: string;
    matchId: string;
    match: Match;
    teamAId: string;
    teamA: Team;
    teamBId: string;
    teamB: Team;
    type: SuperOverType;
    status: SuperOverStatus;
    teamABattingFirst: boolean;
    tossWinnerTeamId: string;
    tossChoice: string;
    currentOver: number;
    currentBall: number;
    teamARuns: number;
    teamAWickets: number;
    teamBRuns: number;
    teamBWickets: number;
    targetRuns: number;
    wonByTeamId: string;
    margin: string;
    completedAt: Date;
    superOverNumber: number;
    createdBy: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    statusChangedAt: Date;
    statusChangedBy: string;
}
