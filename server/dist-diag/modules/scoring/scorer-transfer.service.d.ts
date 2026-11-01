import { DataSource } from 'typeorm';
import { ScorerPermission } from './scorer-permission.entity';
import { TransferScorerDto, AcceptScorerTransferDto, RejectScorerTransferDto, RevokeScorerAccessDto, GrantScorerAccessDto, UpdateScorerRoleDto } from './dto/scorer-transfer.dto';
export declare class ScorerTransferService {
    private dataSource;
    constructor(dataSource: DataSource);
    transferScorer(matchId: string, fromUserId: string, dto: TransferScorerDto): Promise<{
        transfer: ScorerPermission;
        message: string;
    }>;
    acceptScorerTransfer(transferId: string, acceptingUserId: string, dto: AcceptScorerTransferDto): Promise<{
        permission: ScorerPermission;
        message: string;
    }>;
    rejectScorerTransfer(transferId: string, rejectingUserId: string, dto: RejectScorerTransferDto): Promise<{
        message: string;
    }>;
    revokeScorerAccess(matchId: string, fromUserId: string, dto: RevokeScorerAccessDto): Promise<{
        message: string;
    }>;
    grantScorerAccess(matchId: string, fromUserId: string, dto: GrantScorerAccessDto): Promise<{
        permission: ScorerPermission;
        message: string;
    }>;
    updateScorerRole(matchId: string, fromUserId: string, dto: UpdateScorerRoleDto): Promise<{
        permission: ScorerPermission;
        message: string;
    }>;
    getMatchScorers(matchId: string): Promise<ScorerPermission[]>;
    getActiveScorers(matchId: string): Promise<ScorerPermission[]>;
    getPendingTransfers(userId: string): Promise<ScorerPermission[]>;
    canUserScore(matchId: string, userId: string): Promise<boolean>;
    getTransferHistory(matchId: string): Promise<{
        totalTransfers: number;
        pendingTransfers: number;
        completedTransfers: number;
        rejectedTransfers: number;
        revokedTransfers: number;
        transfers: ScorerPermission[];
    }>;
}
