import { GuestPlayerService } from './guest-player.service';
import { CreateGuestPlayerDto, UpdateGuestPlayerDto, ConvertGuestPlayerDto } from './dto/guest-player.dto';
export declare class GuestPlayerController {
    private readonly guestPlayerService;
    constructor(guestPlayerService: GuestPlayerService);
    addGuestPlayer(teamId: string, dto: CreateGuestPlayerDto, req: any, matchId?: string): Promise<{
        data: import("./guest-player.entity").GuestPlayer;
        message: string;
    }>;
    getTeamGuestPlayers(teamId: string): Promise<{
        data: import("./guest-player.entity").GuestPlayer[];
        message: string;
    }>;
    getMatchGuestPlayers(matchId: string): Promise<{
        data: import("./guest-player.entity").GuestPlayer[];
        message: string;
    }>;
    getGuestPlayer(id: string): Promise<{
        data: import("./guest-player.entity").GuestPlayer;
        message: string;
    }>;
    updateGuestPlayer(id: string, dto: UpdateGuestPlayerDto): Promise<{
        data: import("./guest-player.entity").GuestPlayer;
        message: string;
    }>;
    deactivateGuestPlayer(id: string): Promise<{
        message: string;
    }>;
    convertGuestPlayer(id: string, dto: ConvertGuestPlayerDto): Promise<{
        data: {
            user: import("../user/user.entity").User;
            player: import("./player.entity").Player;
        };
        message: string;
    }>;
    canPlayInMatch(id: string, matchId: string): Promise<{
        data: {
            canPlay: boolean;
            reason: string;
        };
        message: string;
    }>;
}
