import { DataSource } from 'typeorm';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { RetireHurtDto, ReturnFromRetirementDto, SubstituteFielderDto } from './dto/retire-hurt.dto';
import { ScorerTransferService } from './scorer-transfer.service';
export declare class RetireHurtService {
    private dataSource;
    private scorerTransferService;
    constructor(dataSource: DataSource, scorerTransferService: ScorerTransferService);
    retireHurt(inningsId: string, userId: string, dto: RetireHurtDto): Promise<{
        performance: PlayerMatchPerformance;
        message: string;
    }>;
    returnFromRetirement(inningsId: string, userId: string, dto: ReturnFromRetirementDto): Promise<{
        performance: PlayerMatchPerformance;
        message: string;
    }>;
    getRetiredHurtPlayers(inningsId: string): Promise<PlayerMatchPerformance[]>;
    handleSubstituteFielder(matchId: string, dto: SubstituteFielderDto): Promise<{
        message: string;
        substitution: any;
    }>;
    canPlayerReturn(inningsId: string, playerId: string): Promise<boolean>;
    getRetirementStats(matchId: string): Promise<{
        totalRetirements: number;
        returnedPlayers: number;
        currentlyRetired: PlayerMatchPerformance[];
    }>;
}
