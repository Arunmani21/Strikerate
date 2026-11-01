import { Team } from '../team/team.entity';
import { MatchRequest } from './match-request.entity';
import { Innings } from '../innings/innings.entity';
import { Ball } from '../scoring/ball.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { TeamMatchHistory } from '../stats/team-match-history.entity';
import { SuperOver } from './super-over.entity';
export declare enum MatchFormat {
    TEST = "TEST",
    ODI = "ODI",
    T20 = "T20",
    T10 = "T10"
}
export declare enum MatchStatus {
    SCHEDULED = "scheduled",
    POSTPONED = "postponed",
    CANCELLED = "cancelled",
    TOSS_DONE = "toss_done",
    LIVE = "live",
    INNINGS_BREAK = "innings_break",
    RAIN_DELAYED = "rain_delayed",
    BAD_LIGHT_DELAYED = "bad_light_delayed",
    UMPIRE_DECISION_PENDING = "umpire_decision_pending",
    COMPLETED = "completed",
    TIED = "tied",
    DRAW = "draw",
    ABANDONED = "abandoned",
    NO_RESULT = "no_result"
}
export declare enum TossDecision {
    BAT = "bat",
    BOWL = "bowl"
}
export declare class Match {
    id: string;
    totalOvers: number;
    venue: string;
    matchDate: Date;
    matchTime: string;
    tossWinnerId: string;
    tossChoice: TossDecision;
    status: MatchStatus;
    currentInnings: number;
    target: number;
    result: string;
    winningTeamId: string;
    winningTeam: Team;
    marginOfVictory: string;
    marginType: string;
    statusChangedAt: Date;
    statusChangedBy: string;
    abandonmentReason: string;
    abandonmentDetails: string;
    weatherConditions: string;
    oversBowled: number;
    totalOversBowled: number;
    teamAId: string;
    teamA: Team;
    teamBId: string;
    teamB: Team;
    createdBy: string;
    matchRequestId: string;
    matchRequest: MatchRequest;
    innings: Innings[];
    balls: Ball[];
    playing11: Playing11[];
    performances: PlayerMatchPerformance[];
    teamHistory: TeamMatchHistory[];
    superOvers: SuperOver[];
    createdAt: Date;
}
