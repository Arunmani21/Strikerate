import { HttpStatus } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { BallInputDto } from './dto/ball-input.dto';
export declare class ScoringController {
    private readonly scoringService;
    constructor(scoringService: ScoringService);
    deliverBall(req: any, dto: BallInputDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./scoring.service").BallResult;
        message: string;
    }>;
    getScorecard(matchId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            match: import("../match/match.entity").Match;
            innings: any[];
        };
        message: string;
    }>;
    getOverSummary(inningsId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: unknown[];
        message: string;
    }>;
}
