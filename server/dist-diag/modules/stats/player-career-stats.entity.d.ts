import { Player } from '../player/player.entity';
export declare class PlayerCareerStats {
    id: string;
    totalMatches: number;
    totalInnings: number;
    totalRuns: number;
    highestScore: number;
    totalFours: number;
    totalSixes: number;
    totalFifties: number;
    totalHundreds: number;
    careerBattingAvg: number;
    careerStrikeRate: number;
    totalNotOuts: number;
    totalDucks: number;
    totalWickets: number;
    totalOversBowled: number;
    totalRunsConceded: number;
    bestBowling: string;
    careerEconomy: number;
    fiveWicketHauls: number;
    totalMaidens: number;
    playerId: string;
    player: Player;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
