import { HttpStatus } from '@nestjs/common';
import { Playing11Service } from './playing11.service';
import { SelectPlaying11Dto } from './dto/select-playing11.dto';
export declare class Playing11Controller {
    private readonly playing11Service;
    constructor(playing11Service: Playing11Service);
    selectPlaying11(matchId: string, teamId: string, req: any, dto: SelectPlaying11Dto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            matchId: string;
            teamId: string;
            regularPlayers: string[];
            guestPlayers: string[];
            totalPlayers: number;
            message: string;
        };
        message: string;
    }>;
    getPlaying11Status(matchId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            matchId: string;
            teamAId: string;
            teamBId: string;
            teamACount: number;
            teamBCount: number;
            teamASelected: boolean;
            teamBSelected: boolean;
            bothTeamsSelected: boolean;
            readyToStart: boolean;
        };
        message: string;
    }>;
    getPlaying11(matchId: string, teamId: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: ({
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
        })[];
        message: string;
    }>;
}
