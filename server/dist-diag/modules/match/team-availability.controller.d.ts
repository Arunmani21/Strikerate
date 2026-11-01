import { HttpStatus } from '@nestjs/common';
import { MatchService } from './match.service';
import { TeamAvailabilityDto } from './dto/team-availability.dto';
export declare class TeamAvailabilityController {
    private readonly matchService;
    constructor(matchService: MatchService);
    postTeamAvailability(teamId: string, req: any, dto: TeamAvailabilityDto): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: import("./team-availability.entity").TeamAvailability;
        message: string;
    }>;
    getAvailableTeams(date: string): Promise<{
        success: boolean;
        statusCode: HttpStatus;
        data: {
            id: string;
            name: string;
            captainId: string;
            availableFrom: string;
            availableUntil: string;
            venue: string;
            preferredOvers: number;
            notes: string;
            availabilityId: string;
        }[];
        message: string;
    }>;
}
