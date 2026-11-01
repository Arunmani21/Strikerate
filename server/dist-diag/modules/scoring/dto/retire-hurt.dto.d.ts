export declare enum RetirementReason {
    INJURY = "injury",
    ILLNESS = "illness",
    EMERGENCY = "emergency",
    OTHER = "other"
}
export declare class RetireHurtDto {
    playerId: string;
    reason: RetirementReason;
    description?: string;
    expectedToReturn?: boolean;
    estimatedReturnTime?: number;
    currentBallNumber?: string;
    notes?: string;
}
export declare class ReturnFromRetirementDto {
    playerId: string;
    ballNumber?: string;
    fullyFit?: boolean;
    notes?: string;
}
export declare class SubstituteFielderDto {
    playerId: string;
    substitutePlayerId: string;
    reason?: RetirementReason;
    expectedTimeAway?: number;
    notes?: string;
}
