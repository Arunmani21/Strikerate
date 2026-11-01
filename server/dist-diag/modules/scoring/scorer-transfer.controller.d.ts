import { ScorerTransferService } from './scorer-transfer.service';
import { TransferScorerDto, AcceptScorerTransferDto, RejectScorerTransferDto, RevokeScorerAccessDto, GrantScorerAccessDto, UpdateScorerRoleDto } from './dto/scorer-transfer.dto';
export declare class ScorerTransferController {
    private readonly scorerTransferService;
    constructor(scorerTransferService: ScorerTransferService);
    transferScorer(matchId: string, req: any, dto: TransferScorerDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            transfer: import("./scorer-permission.entity").ScorerPermission;
            message: string;
        };
        message: string;
    }>;
    acceptScorerTransfer(req: any, dto: AcceptScorerTransferDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            permission: import("./scorer-permission.entity").ScorerPermission;
            message: string;
        };
        message: string;
    }>;
    rejectScorerTransfer(req: any, dto: RejectScorerTransferDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            message: string;
        };
        message: string;
    }>;
    revokeScorerAccess(matchId: string, req: any, dto: RevokeScorerAccessDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            message: string;
        };
        message: string;
    }>;
    grantScorerAccess(matchId: string, req: any, dto: GrantScorerAccessDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            permission: import("./scorer-permission.entity").ScorerPermission;
            message: string;
        };
        message: string;
    }>;
    updateScorerRole(matchId: string, req: any, dto: UpdateScorerRoleDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            permission: import("./scorer-permission.entity").ScorerPermission;
            message: string;
        };
        message: string;
    }>;
    getMatchScorers(matchId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./scorer-permission.entity").ScorerPermission[];
        message: string;
    }>;
    getActiveScorers(matchId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./scorer-permission.entity").ScorerPermission[];
        message: string;
    }>;
    getPendingTransfers(req: any): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./scorer-permission.entity").ScorerPermission[];
        message: string;
    }>;
    canUserScore(matchId: string, req: any): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            canScore: boolean;
            message: string;
        };
        message: string;
    }>;
    getTransferHistory(matchId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            totalTransfers: number;
            pendingTransfers: number;
            completedTransfers: number;
            rejectedTransfers: number;
            revokedTransfers: number;
            transfers: import("./scorer-permission.entity").ScorerPermission[];
        };
        message: string;
    }>;
}
