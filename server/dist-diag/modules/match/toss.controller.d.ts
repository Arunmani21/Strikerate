import { HttpStatus } from '@nestjs/common';
import { MatchService } from './match.service';
import { TossDto } from './dto/toss.dto';
export declare class TossController {
    private readonly matchService;
    constructor(matchService: MatchService);
    recordToss(matchId: string, req: any, dto: TossDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./match.entity").Match;
        message: string;
    }>;
}
