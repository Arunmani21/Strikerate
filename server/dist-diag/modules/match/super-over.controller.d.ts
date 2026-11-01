import { SuperOverService } from './super-over.service';
import { StartSuperOverDto, SuperOverBallDto, CompleteSuperOverDto, AbandonSuperOverDto, SuperOverStatusDto } from './dto/super-over.dto';
export declare class SuperOverController {
    private readonly superOverService;
    constructor(superOverService: SuperOverService);
    startSuperOver(matchId: string, startSuperOverDto: StartSuperOverDto, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    beginSuperOverInnings(superOverId: string, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    deliverSuperOverBall(superOverId: string, superOverBallDto: SuperOverBallDto, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    completeSuperOver(superOverId: string, completeSuperOverDto: CompleteSuperOverDto, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    abandonSuperOver(superOverId: string, abandonSuperOverDto: AbandonSuperOverDto, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    updateSuperOverStatus(superOverId: string, superOverStatusDto: SuperOverStatusDto, req: any): Promise<{
        superOver: import("./super-over.entity").SuperOver;
        message: string;
    }>;
    getSuperOver(superOverId: string): Promise<import("./super-over.entity").SuperOver>;
    getMatchSuperOvers(matchId: string): Promise<import("./super-over.entity").SuperOver[]>;
}
