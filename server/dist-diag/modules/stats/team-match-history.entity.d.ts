import { Team } from '../team/team.entity';
import { Match } from '../match/match.entity';
export declare class TeamMatchHistory {
    id: string;
    result: string;
    runsScored: number;
    wicketsLost: number;
    oversPlayed: number;
    runsConceded: number;
    wicketsTaken: number;
    matchDate: Date;
    teamId: string;
    team: Team;
    matchId: string;
    match: Match;
    opponentId: string;
    createdAt: Date;
}
