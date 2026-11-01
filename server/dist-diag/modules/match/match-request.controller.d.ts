import { HttpStatus } from '@nestjs/common';
import { MatchService } from './match.service';
import { RespondRequestDto } from './dto/match-request.dto';
export declare class MatchRequestController {
    private readonly matchService;
    constructor(matchService: MatchService);
    getTeamMatchRequests(teamId: string, req: any): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match-request.entity").MatchRequest[];
        message: string;
    }>;
    respondToMatchRequest(requestId: string, req: any, dto: RespondRequestDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match.entity").Match | {
            message: string;
        };
        message: string;
    }>;
}
