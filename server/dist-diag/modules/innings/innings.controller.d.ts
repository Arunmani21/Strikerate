import { HttpStatus } from '@nestjs/common';
import { InningsService } from './innings.service';
import { StartInningsDto } from './dto/start-innings.dto';
import { SetBatsmenDto } from './dto/set-batsmen.dto';
import { SetBowlerDto } from './dto/set-bowler.dto';
export declare class InningsController {
    private readonly inningsService;
    constructor(inningsService: InningsService);
    startInnings(matchId: string, req: any, dto: StartInningsDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./innings.entity").Innings;
        message: string;
    }>;
    setBatsmen(inningsId: string, req: any, dto: SetBatsmenDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./innings.entity").Innings;
        message: string;
    }>;
    setBowler(inningsId: string, req: any, dto: SetBowlerDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./innings.entity").Innings;
        message: string;
    }>;
    getInnings(inningsId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./innings.entity").Innings;
        message: string;
    }>;
    getMatchInnings(matchId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./innings.entity").Innings[];
        message: string;
    }>;
}
