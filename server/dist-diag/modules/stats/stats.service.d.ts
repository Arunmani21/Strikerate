import { DataSource } from 'typeorm';
import { PlayerMatchPerformance } from './player-match-performance.entity';
import { PlayerCareerStats } from './player-career-stats.entity';
import { TeamMatchHistory } from './team-match-history.entity';
import { MatchPermissionService } from '../../common/match-permission.service';
export declare class StatsService {
    private dataSource;
    private readonly matchPermission;
    constructor(dataSource: DataSource, matchPermission: MatchPermissionService);
    calculateMatchPerformance(matchId: string, userId: string): Promise<{
        message: string;
    }>;
    private calculateMaidens;
    private recalculateCareerStats;
    private createTeamMatchHistory;
    getPlayerCareerStats(playerId: string): Promise<PlayerCareerStats>;
    getPlayerMatchHistory(playerId: string): Promise<PlayerMatchPerformance[]>;
    getMatchPerformances(matchId: string): Promise<PlayerMatchPerformance[]>;
    getTeamHistory(teamId: string): Promise<TeamMatchHistory[]>;
    setPlayerOfMatch(matchId: string, playerId: string, userId: string): Promise<{
        message: string;
    }>;
}
