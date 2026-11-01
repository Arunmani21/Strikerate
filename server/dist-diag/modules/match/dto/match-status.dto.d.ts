import { MatchStatus } from '../match.entity';
export declare class UpdateMatchStatusDto {
    status: MatchStatus;
    reason?: string;
    winningTeamId?: string;
    marginOfVictory?: string;
    marginType?: string;
    details?: Record<string, any>;
    weatherConditions?: string;
    oversBowled?: number;
    totalOversBowled?: number;
}
export declare class AbandonMatchDto {
    reason: string;
    details?: string;
    weatherConditions?: string;
    oversBowled?: number;
    totalOvers?: number;
    canBeResumed?: boolean;
    metadata?: Record<string, any>;
}
export declare class CompleteMatchDto {
    winningTeamId: string;
    victoryType: string;
    margin: number;
    resultDescription?: string;
}
export declare class DeclareMatchTiedDto {
    description?: string;
    details?: Record<string, any>;
}
export declare class DeclareMatchDrawDto {
    description?: string;
    reason?: string;
    details?: Record<string, any>;
}
export declare class DelayMatchDto {
    delayType: 'rain' | 'bad_light';
    estimatedDuration: number;
    description?: string;
    weatherConditions?: string;
    matchSituation?: Record<string, any>;
    expectedResumption?: string;
}
export declare class ResumeMatchDto {
    description?: string;
    timeLost?: number;
    oversReduced?: number;
    details?: Record<string, any>;
}
export declare class PostponeMatchDto {
    reason: string;
    rescheduledDate: string;
    rescheduledTime: string;
    details?: Record<string, any>;
}
export declare class CancelMatchDto {
    reason?: string;
}
