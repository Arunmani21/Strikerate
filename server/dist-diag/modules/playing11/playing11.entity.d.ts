import { Match } from '../match/match.entity';
import { Team } from '../team/team.entity';
import { Player } from '../player/player.entity';
import { GuestPlayer } from '../player/guest-player.entity';
export declare class Playing11 {
    id: string;
    matchId: string;
    match: Match;
    teamId: string;
    team: Team;
    playerId: string;
    player: Player;
    isGuest: boolean;
    guestPlayerId: string;
    guestPlayer: GuestPlayer;
    selectedBy: string;
    createdAt: Date;
}
