import { Match } from '../match/match.entity';
import { User } from '../user/user.entity';
export declare enum ScorerRole {
    PRIMARY_SCORER = "primary_scorer",
    SECONDARY_SCORER = "secondary_scorer",
    TEMPORARY_SCORER = "temporary_scorer",
    VIEWER = "viewer"
}
export declare enum TransferStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    REVOKED = "revoked"
}
export declare class ScorerPermission {
    id: string;
    matchId: string;
    match: Match;
    userId: string;
    user: User;
    role: ScorerRole;
    isActive: boolean;
    canScore: boolean;
    transferredFrom: string;
    transferredFromUser: User;
    transferredTo: string;
    transferredToUser: User;
    transferStatus: TransferStatus;
    transferredAt: Date;
    acceptedAt: Date;
    revokedAt: Date;
    transferReason: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
