import { MatchStatusService } from './match-status.service';
import { MatchStatus } from './match.entity';
import { AbandonMatchDto, CompleteMatchDto, DeclareMatchTiedDto, DeclareMatchDrawDto, DelayMatchDto, ResumeMatchDto, PostponeMatchDto, CancelMatchDto } from './dto/match-status.dto';
export declare class MatchStatusController {
    private readonly matchStatusService;
    constructor(matchStatusService: MatchStatusService);
    abandonMatch(matchId: string, req: any, dto: AbandonMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    completeMatch(matchId: string, req: any, dto: CompleteMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    declareMatchTied(matchId: string, req: any, dto: DeclareMatchTiedDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
            canPlaySuperOver: boolean;
        };
        message: string;
    }>;
    declareMatchDraw(matchId: string, req: any, dto: DeclareMatchDrawDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    delayMatch(matchId: string, req: any, dto: DelayMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    resumeMatch(matchId: string, req: any, dto: ResumeMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    postponeMatch(matchId: string, req: any, dto: PostponeMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    cancelMatch(matchId: string, req: any, dto: CancelMatchDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            match: import("./match.entity").Match;
            message: string;
        };
        message: string;
    }>;
    getLiveMatches(): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./match.entity").Match[];
        message: string;
    }>;
    getUpcomingMatches(): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./match.entity").Match[];
        message: string;
    }>;
    getCompletedMatches(): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./match.entity").Match[];
        message: string;
    }>;
    getMatchesByStatus(status: MatchStatus): Promise<{
        success: boolean;
        statusCode: number;
        data: import("./match.entity").Match[];
        message: string;
    }>;
}
