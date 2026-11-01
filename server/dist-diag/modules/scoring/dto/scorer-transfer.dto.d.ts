import { ScorerRole } from '../scorer-permission.entity';
export declare class TransferScorerDto {
    transferToUserId: string;
    reason?: string;
    role?: ScorerRole;
    revokeCurrentPermissions?: boolean;
    estimatedTimeAway?: number;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class AcceptScorerTransferDto {
    transferRequestId: string;
    notes?: string;
    activateImmediately?: boolean;
}
export declare class RejectScorerTransferDto {
    transferRequestId: string;
    reason: string;
}
export declare class RevokeScorerAccessDto {
    userId: string;
    reason?: string;
}
export declare class GrantScorerAccessDto {
    userId: string;
    role: ScorerRole;
    reason?: string;
}
export declare class UpdateScorerRoleDto {
    userId: string;
    role: ScorerRole;
    reason?: string;
}
