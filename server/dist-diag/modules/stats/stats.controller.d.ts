import { HttpStatus } from '@nestjs/common';
import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    calculateMatchPerformance(matchId: string, req: any): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            message: string;
        };
        message: string;
    }>;
    setPlayerOfMatch(matchId: string, playerId: string, req: any): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            message: string;
        };
        message: string;
    }>;
    getPlayerCareerStats(playerId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./player-career-stats.entity").PlayerCareerStats;
        message: string;
    }>;
    getPlayerMatchHistory(playerId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./player-match-performance.entity").PlayerMatchPerformance[];
        message: string;
    }>;
    getMatchPerformances(matchId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./player-match-performance.entity").PlayerMatchPerformance[];
        message: string;
    }>;
    getTeamHistory(teamId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./team-match-history.entity").TeamMatchHistory[];
        message: string;
    }>;
}
