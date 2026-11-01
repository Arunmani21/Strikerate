import { RetireHurtService } from './retire-hurt.service';
import { RetireHurtDto, ReturnFromRetirementDto, SubstituteFielderDto } from './dto/retire-hurt.dto';
export declare class RetireHurtController {
    private readonly retireHurtService;
    constructor(retireHurtService: RetireHurtService);
    retireHurt(inningsId: string, req: any, dto: RetireHurtDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            performance: import("../stats/player-match-performance.entity").PlayerMatchPerformance;
            message: string;
        };
        message: string;
    }>;
    returnFromRetirement(inningsId: string, req: any, dto: ReturnFromRetirementDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            performance: import("../stats/player-match-performance.entity").PlayerMatchPerformance;
            message: string;
        };
        message: string;
    }>;
    getRetiredHurtPlayers(inningsId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: import("../stats/player-match-performance.entity").PlayerMatchPerformance[];
        message: string;
    }>;
    canPlayerReturn(inningsId: string, playerId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            canReturn: boolean;
            reason: string;
        };
        message: string;
    }>;
    handleSubstituteFielder(matchId: string, dto: SubstituteFielderDto): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            message: string;
            substitution: any;
        };
        message: string;
    }>;
    getRetirementStats(matchId: string): Promise<{
        success: boolean;
        statusCode: number;
        data: {
            totalRetirements: number;
            returnedPlayers: number;
            currentlyRetired: import("../stats/player-match-performance.entity").PlayerMatchPerformance[];
        };
        message: string;
    }>;
}
