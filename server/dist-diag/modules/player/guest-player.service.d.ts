import { DataSource } from 'typeorm';
import { GuestPlayer } from './guest-player.entity';
import { Player } from './player.entity';
import { User } from '../user/user.entity';
import { CreateGuestPlayerDto, UpdateGuestPlayerDto, ConvertGuestPlayerDto } from './dto/guest-player.dto';
export declare class GuestPlayerService {
    private dataSource;
    constructor(dataSource: DataSource);
    addGuestPlayer(teamId: string, dto: CreateGuestPlayerDto, addedBy: string, matchId?: string): Promise<GuestPlayer>;
    getTeamGuestPlayers(teamId: string): Promise<GuestPlayer[]>;
    getGuestPlayer(id: string): Promise<GuestPlayer>;
    updateGuestPlayer(id: string, dto: UpdateGuestPlayerDto): Promise<GuestPlayer>;
    deactivateGuestPlayer(id: string): Promise<void>;
    convertGuestPlayer(guestPlayerId: string, dto: ConvertGuestPlayerDto): Promise<{
        user: User;
        player: Player;
    }>;
    getMatchGuestPlayers(matchId: string): Promise<GuestPlayer[]>;
    canPlayInMatch(guestPlayerId: string, matchId: string): Promise<boolean>;
}
