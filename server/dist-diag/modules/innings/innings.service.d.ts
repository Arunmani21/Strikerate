import { DataSource } from 'typeorm';
import { Innings } from './innings.entity';
import { StartInningsDto } from './dto/start-innings.dto';
import { SetBatsmenDto } from './dto/set-batsmen.dto';
import { SetBowlerDto } from './dto/set-bowler.dto';
export declare class InningsService {
    private dataSource;
    constructor(dataSource: DataSource);
    startInnings(matchId: string, userId: string, dto: StartInningsDto): Promise<Innings>;
    setBatsmen(inningsId: string, userId: string, dto: SetBatsmenDto): Promise<Innings>;
    setBowler(inningsId: string, userId: string, dto: SetBowlerDto): Promise<Innings>;
    getInnings(inningsId: string): Promise<Innings>;
    getMatchInnings(matchId: string): Promise<Innings[]>;
}
