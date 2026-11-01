import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Match } from '../match/match.entity';
import { Team } from '../team/team.entity';
import { Player } from '../player/player.entity';
import { GuestPlayer } from '../player/guest-player.entity';

@Entity('playing11')
@Index(['matchId'])
@Index(['teamId'])
@Index(['playerId'])
export class Playing11 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id', nullable: false })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.playing11, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.playing11, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'player_id', nullable: true })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.playing11, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'is_guest', default: false })
  isGuest: boolean;

  @Column({ name: 'guest_player_id', nullable: true })
  guestPlayerId: string;

  @ManyToOne(() => GuestPlayer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guest_player_id' })
  guestPlayer: GuestPlayer;

  @Column({ name: 'selected_by', nullable: false })
  selectedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
