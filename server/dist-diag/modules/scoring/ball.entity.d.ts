import { Innings } from '../innings/innings.entity';
import { Match } from '../match/match.entity';
export declare enum DismissalType {
    BOWLED = "bowled",
    CAUGHT = "caught",
    LBW = "lbw",
    RUNOUT = "runout",
    STUMPED = "stumped",
    CAUGHT_AND_BOWLED = "caught_and_bowled",
    HIT_WICKET = "hit_wicket",
    RETIRED_HURT = "retired_hurt"
}
export declare class Ball {
    id: string;
    overNumber: number;
    ballNumber: number;
    runs: number;
    extraRuns: number;
    isWide: boolean;
    isNoBall: boolean;
    isBye: boolean;
    isLegBye: boolean;
    isWicket: boolean;
    wicketType: DismissalType;
    inningsId: string;
    innings: Innings;
    matchId: string;
    match: Match;
    batsmanId: string;
    bowlerId: string;
    dismissedPlayerId: string;
    commentary: string;
    createdAt: Date;
}
