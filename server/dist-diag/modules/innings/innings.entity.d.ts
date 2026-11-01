import { Match } from '../match/match.entity';
import { Ball } from '../scoring/ball.entity';
export declare class Innings {
    id: string;
    inningsNumber: number;
    totalRuns: number;
    totalWickets: number;
    totalBalls: number;
    currentOver: number;
    isCompleted: boolean;
    matchId: string;
    match: Match;
    battingTeamId: string;
    bowlingTeamId: string;
    strikerId: string;
    nonStrikerId: string;
    currentBowlerId: string;
    balls: Ball[];
}
