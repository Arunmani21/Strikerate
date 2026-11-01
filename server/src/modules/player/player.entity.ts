import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Team } from '../team/team.entity';
import { PlayerAvailability } from './player-availability.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { PlayerCareerStats } from '../stats/player-career-stats.entity';

@Entity('players')
@Unique(['name', 'teamId'])
@Index(['teamId'])
@Index(['userId'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'jersey_number', nullable: true })
  jerseyNumber: number;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // Batting Statistics
  @Column({ name: 'batting_runs', default: 0 })
  battingRuns: number;

  @Column({ name: 'batting_balls', default: 0 })
  battingBalls: number;

  @Column({ name: 'batting_fours', default: 0 })
  battingFours: number;

  @Column({ name: 'batting_sixes', default: 0 })
  battingSixes: number;

  @Column({
    name: 'batting_strike_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  battingStrikeRate: number;

  // Bowling Statistics
  @Column({ name: 'bowling_balls', default: 0 })
  bowlingBalls: number;

  @Column({ name: 'bowling_runs', default: 0 })
  bowlingRuns: number;

  @Column({ name: 'bowling_wickets', default: 0 })
  bowlingWickets: number;

  @Column({
    name: 'bowling_economy',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  bowlingEconomy: number;

  @Column({
    name: 'bowling_overs',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  bowlingOvers: number;

  @Column({ name: 'is_out', default: false })
  isOut: boolean;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.players, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => PlayerAvailability, (availability) => availability.player)
  availabilities: PlayerAvailability[];

  @OneToMany(() => Playing11, (playing11) => playing11.player)
  playing11: Playing11[];

  @OneToMany(() => PlayerMatchPerformance, (performance) => performance.player)
  matchPerformances: PlayerMatchPerformance[];

  @OneToMany(() => PlayerCareerStats, (careerStats) => careerStats.player)
  careerStats: PlayerCareerStats[];
}
