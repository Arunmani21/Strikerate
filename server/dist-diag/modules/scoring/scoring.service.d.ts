import { DataSource } from 'typeorm';
import { Ball, DismissalType } from './ball.entity';
import { Innings } from '../innings/innings.entity';
import { Match } from '../match/match.entity';
import { BallInputDto } from './dto/ball-input.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';
import { ScorerTransferService } from './scorer-transfer.service';
export interface BallResult {
    ball: Ball;
    innings: Innings;
    matchCompleted?: boolean;
    inningsCompleted?: boolean;
    overCompleted?: boolean;
    wicket?: {
        type: DismissalType;
        batsman: string;
        bowler: string;
    };
}
export declare class ScoringService {
    private dataSource;
    private cricketGateway;
    private scorerTransferService;
    constructor(dataSource: DataSource, cricketGateway: CricketGateway, scorerTransferService: ScorerTransferService);
    deliverBall(userId: string, dto: BallInputDto): Promise<BallResult>;
    private generateLastBallSummary;
    private oversFromBalls;
    private roundRate;
    private batterBlock;
    private getMaxWickets;
    getScorecard(matchId: string): Promise<{
        match: Match;
        innings: any[];
    }>;
    getOverSummary(inningsId: string): Promise<unknown[]>;
}
