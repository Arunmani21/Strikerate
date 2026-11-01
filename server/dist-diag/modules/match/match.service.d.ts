import { DataSource } from 'typeorm';
import { TeamAvailability } from './team-availability.entity';
import { MatchRequest } from './match-request.entity';
import { Match } from './match.entity';
import { TeamAvailabilityDto } from './dto/team-availability.dto';
import { MatchRequestDto, RespondRequestDto } from './dto/match-request.dto';
import { TossDto } from './dto/toss.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';
export declare class MatchService {
    private dataSource;
    private cricketGateway;
    constructor(dataSource: DataSource, cricketGateway: CricketGateway);
    postTeamAvailability(teamId: string, userId: string, dto: TeamAvailabilityDto): Promise<TeamAvailability>;
    getAvailableTeams(date: string): Promise<{
        id: string;
        name: string;
        captainId: string;
        availableFrom: string;
        availableUntil: string;
        venue: string;
        preferredOvers: number;
        notes: string;
        availabilityId: string;
    }[]>;
    sendMatchRequest(teamId: string, userId: string, dto: MatchRequestDto): Promise<MatchRequest>;
    getTeamMatchRequests(teamId: string, userId: string): Promise<MatchRequest[]>;
    respondToMatchRequest(requestId: string, userId: string, dto: RespondRequestDto): Promise<Match | {
        message: string;
    }>;
    recordToss(matchId: string, userId: string, dto: TossDto): Promise<Match>;
    getMatch(matchId: string): Promise<Match>;
    getLiveMatches(): Promise<Match[]>;
    getUpcomingMatches(teamId: string): Promise<Match[]>;
}
