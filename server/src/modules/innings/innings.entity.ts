import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Match } from '../match/match.entity';
import { Ball } from '../scoring/ball.entity';

@Entity('innings')
@Index(['matchId'])
@Index(['battingTeamId'])
@Index(['bowlingTeamId'])
export class Innings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'innings_number' })
  inningsNumber: number;

  @Column({ name: 'total_runs', default: 0 })
  totalRuns: number;

  @Column({ name: 'total_wickets', default: 0 })
  totalWickets: number;

  @Column({ name: 'total_balls', default: 0 })
  totalBalls: number;

  @Column({ name: 'current_over', default: 0 })
  currentOver: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'match_id', nullable: false })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.innings)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'batting_team_id', nullable: false })
  battingTeamId: string;

  @Column({ name: 'bowling_team_id', nullable: false })
  bowlingTeamId: string;

  @Column({ name: 'striker_id', nullable: true })
  strikerId: string;

  @Column({ name: 'non_striker_id', nullable: true })
  nonStrikerId: string;

  @Column({ name: 'current_bowler_id', nullable: true })
  currentBowlerId: string;

  @OneToMany(() => Ball, (ball) => ball.innings)
  balls: Ball[];
}
