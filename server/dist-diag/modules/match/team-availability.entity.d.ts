import { Team } from '../team/team.entity';
export declare class TeamAvailability {
    id: string;
    availableDate: Date;
    availableFrom: string;
    availableUntil: string;
    matchId: string;
    userId: string;
    isAvailable: boolean;
    venue: string;
    preferredOvers: number;
    notes: string;
    isOpen: boolean;
    metadata: Record<string, any>;
    teamId: string;
    team: Team;
    postedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
