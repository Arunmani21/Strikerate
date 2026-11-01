import { SuperOverType, SuperOverStatus } from '../super-over.entity';
export declare class SuperOverDecisionDto {
    decision: 'draw' | 'super_over';
    reason?: string;
    metadata?: Record<string, any>;
}
export declare class StartSuperOverDto {
    type: SuperOverType;
    tossWinnerTeamId: string;
    tossChoice?: string;
    targetRuns?: number;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class SuperOverBallDto {
    superOverId: string;
    batsmanId: string;
    bowlerId: string;
    runs: number;
    isWide?: boolean;
    isNoBall?: boolean;
    isBye?: boolean;
    isLegBye?: boolean;
    isWicket?: boolean;
    wicketType?: string;
    dismissedPlayerId?: string;
    commentary?: string;
    metadata?: Record<string, any>;
}
export declare class CompleteSuperOverDto {
    winningTeamId: string;
    margin: string;
    details?: Record<string, any>;
}
export declare class AbandonSuperOverDto {
    reason: string;
    details?: string;
    matchSituation?: Record<string, any>;
}
export declare class SuperOverStatusDto {
    status: SuperOverStatus;
    reason?: string;
}
