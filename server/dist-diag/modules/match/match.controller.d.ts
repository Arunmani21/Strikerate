import { HttpStatus } from '@nestjs/common';
import { MatchService } from './match.service';
export declare class MatchController {
    private readonly matchService;
    constructor(matchService: MatchService);
    getLiveMatches(): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match.entity").Match[];
        message: string;
    }>;
    getMatch(matchId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match.entity").Match;
        message: string;
    }>;
}
