import { DataSource } from 'typeorm';
import { SelectPlaying11Dto } from './dto/select-playing11.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';
export declare class Playing11Service {
    private dataSource;
    private cricketGateway;
    constructor(dataSource: DataSource, cricketGateway: CricketGateway);
    selectPlaying11(matchId: string, teamId: string, userId: string, dto: SelectPlaying11Dto): Promise<{
        matchId: string;
        teamId: string;
        regularPlayers: string[];
        guestPlayers: string[];
        totalPlayers: number;
        message: string;
    }>;
    getPlaying11(matchId: string, teamId: string): Promise<({
        id: string;
        name: string;
        isGuest: boolean;
        mobile: string;
        battingStyle: string;
        bowlingStyle: string;
        role: string;
        jerseyNumber?: undefined;
    } | {
        id: string;
        name: string;
        isGuest: boolean;
        jerseyNumber: number;
        mobile?: undefined;
        battingStyle?: undefined;
        bowlingStyle?: undefined;
        role?: undefined;
    })[]>;
    getPlaying11Status(matchId: string): Promise<{
        matchId: string;
        teamAId: string;
        teamBId: string;
        teamACount: number;
        teamBCount: number;
        teamASelected: boolean;
        teamBSelected: boolean;
        bothTeamsSelected: boolean;
        readyToStart: boolean;
    }>;
}
