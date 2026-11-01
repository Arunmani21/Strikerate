import { DataSource } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { MatchPermissionService } from '../../common/match-permission.service';
import { UpdateMatchStatusDto, AbandonMatchDto, CompleteMatchDto, DeclareMatchTiedDto, DeclareMatchDrawDto, DelayMatchDto, ResumeMatchDto, PostponeMatchDto, CancelMatchDto } from './dto/match-status.dto';
export declare class MatchStatusService {
    private dataSource;
    private readonly matchPermission;
    constructor(dataSource: DataSource, matchPermission: MatchPermissionService);
    updateMatchStatus(matchId: string, dto: UpdateMatchStatusDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    abandonMatch(matchId: string, dto: AbandonMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    completeMatch(matchId: string, dto: CompleteMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    declareMatchTied(matchId: string, dto: DeclareMatchTiedDto, userId: string): Promise<{
        match: Match;
        message: string;
        canPlaySuperOver: boolean;
    }>;
    declareMatchDraw(matchId: string, dto: DeclareMatchDrawDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    delayMatch(matchId: string, dto: DelayMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    resumeMatch(matchId: string, dto: ResumeMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    postponeMatch(matchId: string, dto: PostponeMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    cancelMatch(matchId: string, dto: CancelMatchDto, userId: string): Promise<{
        match: Match;
        message: string;
    }>;
    getMatchesByStatus(status: MatchStatus): Promise<Match[]>;
    getLiveMatches(): Promise<Match[]>;
    getUpcomingMatches(): Promise<Match[]>;
    getCompletedMatches(): Promise<Match[]>;
    private validateStatusTransition;
}
