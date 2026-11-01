import { DataSource } from 'typeorm';
import { MatchPermissionService } from '../../common/match-permission.service';
import { SuperOver } from './super-over.entity';
import { StartSuperOverDto, SuperOverBallDto, CompleteSuperOverDto, AbandonSuperOverDto, SuperOverStatusDto } from './dto/super-over.dto';
export declare class SuperOverService {
    private dataSource;
    private readonly matchPermission;
    constructor(dataSource: DataSource, matchPermission: MatchPermissionService);
    startSuperOver(matchId: string, dto: StartSuperOverDto, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    beginSuperOverInnings(superOverId: string, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    deliverSuperOverBall(superOverId: string, dto: SuperOverBallDto, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    completeSuperOver(superOverId: string, dto: CompleteSuperOverDto, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    abandonSuperOver(superOverId: string, dto: AbandonSuperOverDto, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    updateSuperOverStatus(superOverId: string, dto: SuperOverStatusDto, userId: string): Promise<{
        superOver: SuperOver;
        message: string;
    }>;
    getSuperOver(superOverId: string): Promise<SuperOver>;
    getMatchSuperOvers(matchId: string): Promise<SuperOver[]>;
    private determineSuperOverWinner;
    private updateMatchAfterSuperOver;
    private validateSuperOverStatusTransition;
}
