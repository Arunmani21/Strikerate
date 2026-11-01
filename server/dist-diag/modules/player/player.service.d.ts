import { DataSource } from 'typeorm';
import { Player } from './player.entity';
import { PlayerAvailability } from './player-availability.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerAvailabilityDto } from './dto/player-availability.dto';
export declare class PlayerService {
    private dataSource;
    constructor(dataSource: DataSource);
    addPlayer(teamId: string, dto: CreatePlayerDto): Promise<Player>;
    removePlayer(teamId: string, playerId: string): Promise<{
        message: string;
    }>;
    getTeamPlayers(teamId: string): Promise<Player[]>;
    getAvailablePlayers(teamId: string, date: string): Promise<{
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
        availabilities: PlayerAvailability[];
        playing11: import("../playing11/playing11.entity").Playing11[];
        matchPerformances: import("../stats/player-match-performance.entity").PlayerMatchPerformance[];
        careerStats: import("../stats/player-career-stats.entity").PlayerCareerStats[];
    }[]>;
    setPlayerAvailability(userId: string, dto: UpdatePlayerAvailabilityDto): Promise<{
        message: string;
    }>;
}
