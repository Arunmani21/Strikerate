import { PlayerService } from '../player/player.service';
import { UpdatePlayerAvailabilityDto } from '../player/dto/player-availability.dto';
export declare class AvailabilityController {
    private playerService;
    constructor(playerService: PlayerService);
    setPlayerAvailability(req: any, dto: UpdatePlayerAvailabilityDto): Promise<{
        data: {
            message: string;
        };
        message: string;
    }>;
}
