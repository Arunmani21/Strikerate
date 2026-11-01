import { HttpStatus } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchRequestDto } from './dto/match-request.dto';
export declare class TeamMatchesController {
    private readonly matchService;
    constructor(matchService: MatchService);
    sendMatchRequest(teamId: string, req: any, dto: MatchRequestDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match-request.entity").MatchRequest;
        message: string;
    }>;
    getUpcomingMatches(teamId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match.entity").Match[];
        message: string;
    }>;
}
