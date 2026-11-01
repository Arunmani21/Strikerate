import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
export declare class PlayerController {
    private playerService;
    constructor(playerService: PlayerService);
    addPlayer(teamId: string, dto: CreatePlayerDto): Promise<{
        data: import("./player.entity").Player;
        message: string;
    }>;
    removePlayer(teamId: string, playerId: string): Promise<{
        data: {
            message: string;
        };
        message: string;
    }>;
    getTeamPlayers(teamId: string): Promise<{
        data: import("./player.entity").Player[];
        message: string;
    }>;
    getAvailablePlayers(teamId: string, date: string): Promise<{
        data: {
            isAvailable: any;
            id: string;
            name: string;
            jerseyNumber: number;
            userId: string;
            battingRuns: number;
            battingBalls: number;
            battingFours: number;
            battingSixes: number;
            battingStrikeRate: number;
            bowlingBalls: number;
            bowlingRuns: number;
            bowlingWickets: number;
            bowlingEconomy: number;
            bowlingOvers: number;
            isOut: boolean;
            teamId: string;
            team: import("../team/team.entity").Team;
            availabilities: import("./player-availability.entity").PlayerAvailability[];
            playing11: import("../playing11/playing11.entity").Playing11[];
            matchPerformances: import("../stats/player-match-performance.entity").PlayerMatchPerformance[];
            careerStats: import("../stats/player-career-stats.entity").PlayerCareerStats[];
        }[];
        message: string;
    }>;
}
