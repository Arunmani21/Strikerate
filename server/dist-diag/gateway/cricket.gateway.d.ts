import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class CricketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinMatch(client: Socket, matchId: string): void;
    handleLeaveMatch(client: Socket, matchId: string): void;
    emitBallUpdated(matchId: string, data: {
        overNumber: number;
        ballNumber: number;
        totalRuns: number;
        totalWickets: number;
        currentOvers: number;
        currentRunRate: number;
        requiredRunRate?: number;
        target?: number;
        striker: {
            id: string;
            name: string;
            runs: number;
            balls: number;
            fours: number;
            sixes: number;
            strikeRate: number;
        };
        nonStriker: {
            id: string;
            name: string;
            runs: number;
            balls: number;
            fours: number;
            sixes: number;
            strikeRate: number;
        };
        bowler: {
            id: string;
            name: string;
            overs: string;
            runs: number;
            wickets: number;
            economy: number;
        };
        extras: number;
        lastBall: string;
    }): void;
    emitWicket(matchId: string, data: {
        dismissedPlayer: {
            id: string;
            name: string;
            runs: number;
            balls: number;
            fours: number;
            sixes: number;
        };
        wicketType: string;
        wicketNumber: number;
        totalWickets: number;
        totalRuns: number;
        currentOvers: number;
    }): void;
    emitOverComplete(matchId: string, data: {
        overNumber: number;
        overRuns: number;
        totalRuns: number;
        totalWickets: number;
        currentOvers: number;
        currentRunRate: number;
        requiredRunRate?: number;
        target?: number;
        bowlerSummary: {
            bowlerName: string;
            overs: string;
            runs: number;
            wickets: number;
            maidens: number;
            economy: number;
        };
    }): void;
    emitInningsEnd(matchId: string, data: {
        inningsNumber: number;
        totalRuns: number;
        totalWickets: number;
        totalOvers: number;
        target?: number;
        battingTeam: {
            id: string;
            name: string;
        };
        bowlingTeam: {
            id: string;
            name: string;
        };
    }): void;
    emitMatchResult(matchId: string, data: {
        result: string;
        winningTeam?: {
            id: string;
            name: string;
        };
        margin?: string;
        teamAScore: {
            teamName: string;
            runs: number;
            wickets: number;
            overs: number;
        };
        teamBScore: {
            teamName: string;
            runs: number;
            wickets: number;
            overs: number;
        };
        playerOfMatch?: {
            id: string;
            name: string;
        };
    }): void;
    emitMatchStarted(matchId: string, data: {
        matchId: string;
        teamA: {
            id: string;
            name: string;
        };
        teamB: {
            id: string;
            name: string;
        };
        totalOvers: number;
        venue: string;
    }): void;
    emitTossResult(matchId: string, data: {
        tossWinner: {
            id: string;
            name: string;
        };
        tossChoice: 'bat' | 'bowl';
        teamA: {
            id: string;
            name: string;
        };
        teamB: {
            id: string;
            name: string;
        };
    }): void;
    emitPlaying11Updated(matchId: string, data: {
        teamId: string;
        teamName: string;
        players: Array<{
            id: string;
            name: string;
            jerseyNumber?: number;
        }>;
    }): void;
    emitError(matchId: string, error: {
        message: string;
        code?: string;
        details?: any;
    }): void;
    getMatchViewers(matchId: string): number;
}
