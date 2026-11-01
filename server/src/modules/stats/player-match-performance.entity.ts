import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Player } from '../player/player.entity';
import { Match } from '../match/match.entity';
import { Team } from '../team/team.entity';

@Entity('player_match_performances')
@Index(['playerId'])
@Index(['matchId'])
@Index(['teamId'])
export class PlayerMatchPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Batting statistics
  @Column({ name: 'runs_scored', default: 0 })
  runsScored: number;

  @Column({ name: 'balls_faced', default: 0 })
  ballsFaced: number;

  @Column({ default: 0 })
  fours: number;

  @Column({ default: 0 })
  sixes: number;

  @Column({ name: 'strike_rate', type: 'decimal', precision: 7, scale: 2, default: 0 })
  strikeRate: number;

  @Column({ name: 'is_out', default: false })
  isOut: boolean;

  @Column({ name: 'wicket_type', nullable: true })
  wicketType: string;

  @Column({ name: 'batting_position', nullable: true })
  battingPosition: number;

  // Retire Hurt fields
  @Column({ name: 'is_retired_hurt', default: false })
  isRetiredHurt: boolean;

  @Column({ name: 'retired_hurt_at', nullable: true })
  retiredHurtAt: Date;

  @Column({ name: 'retired_hurt_ball_number', nullable: true })
  retiredHurtBallNumber: number;

  @Column({ name: 'returned_from_retirement', default: false })
  returnedFromRetirement: boolean;

  @Column({ name: 'returned_at_ball', nullable: true })
  returnedAtBall: number;

  // Bowling statistics
  @Column({ name: 'overs_bowled', type: 'decimal', precision: 5, scale: 2, default: 0 })
  oversBowled: number;

  @Column({ name: 'runs_conceded', default: 0 })
  runsConceded: number;

  @Column({ name: 'wickets_taken', default: 0 })
  wicketsTaken: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  economy: number;

  @Column({ default: 0 })
  maidens: number;

  @Column({ name: 'wides', default: 0 })
  wides: number;

  @Column({ name: 'no_balls', default: 0 })
  noBalls: number;

  // Overall performance
  @Column({ name: 'match_rating', type: 'decimal', precision: 3, scale: 1, nullable: true })
  matchRating: number;

  @Column({ name: 'is_player_of_match', default: false })
  isPlayerOfMatch: boolean;

  @Column({ name: 'player_id', nullable: false })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.matchPerformances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'match_id', nullable: false })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.performances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.performances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
