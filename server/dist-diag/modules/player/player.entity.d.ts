import { Team } from '../team/team.entity';
import { PlayerAvailability } from './player-availability.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { PlayerCareerStats } from '../stats/player-career-stats.entity';
export declare class Player {
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
    team: Team;
    availabilities: PlayerAvailability[];
    playing11: Playing11[];
    matchPerformances: PlayerMatchPerformance[];
    careerStats: PlayerCareerStats[];
}
