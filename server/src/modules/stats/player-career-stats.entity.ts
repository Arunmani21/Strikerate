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

@Entity('player_career_stats')
@Index(['playerId'])
@Index(['userId'])
export class PlayerCareerStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Career batting statistics
  @Column({ name: 'total_matches', default: 0 })
  totalMatches: number;

  @Column({ name: 'total_innings', default: 0 })
  totalInnings: number;

  @Column({ name: 'total_runs', default: 0 })
  totalRuns: number;

  @Column({ name: 'highest_score', default: 0 })
  highestScore: number;

  @Column({ name: 'total_fours', default: 0 })
  totalFours: number;

  @Column({ name: 'total_sixes', default: 0 })
  totalSixes: number;

  @Column({ name: 'total_fifties', default: 0 })
  totalFifties: number;

  @Column({ name: 'total_hundreds', default: 0 })
  totalHundreds: number;

  @Column({
    name: 'career_batting_avg',
    type: 'decimal',
    precision: 7,
    scale: 2,
    default: 0,
  })
  careerBattingAvg: number;

  @Column({
    name: 'career_strike_rate',
    type: 'decimal',
    precision: 7,
    scale: 2,
    default: 0,
  })
  careerStrikeRate: number;

  @Column({ name: 'total_not_outs', default: 0 })
  totalNotOuts: number;

  @Column({ name: 'total_ducks', default: 0 })
  totalDucks: number;

  // Career bowling statistics
  @Column({ name: 'total_wickets', default: 0 })
  totalWickets: number;

  @Column({ name: 'total_overs_bowled', type: 'decimal', precision: 7, scale: 2, default: 0 })
  totalOversBowled: number;

  @Column({ name: 'total_runs_conceded', default: 0 })
  totalRunsConceded: number;

  @Column({ name: 'best_bowling', nullable: true })
  bestBowling: string; // Format: "wickets/runs" e.g., "5/23"

  @Column({
    name: 'career_economy',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  careerEconomy: number;

  @Column({ name: 'five_wicket_hauls', default: 0 })
  fiveWicketHauls: number;

  @Column({ name: 'total_maidens', default: 0 })
  totalMaidens: number;

  @Column({ name: 'player_id', nullable: false })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.careerStats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
