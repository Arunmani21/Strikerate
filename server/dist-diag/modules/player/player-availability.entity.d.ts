import { Player } from './player.entity';
export declare class PlayerAvailability {
    id: string;
    availableDate: Date;
    isAvailable: boolean;
    reason: string;
    playerId: string;
    player: Player;
    userId: string;
}
