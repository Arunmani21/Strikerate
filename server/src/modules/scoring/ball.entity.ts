import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Innings } from '../innings/innings.entity';
import { Match } from '../match/match.entity';

export enum DismissalType {
  BOWLED = 'bowled',
  CAUGHT = 'caught',
  LBW = 'lbw',
  RUNOUT = 'runout',
  STUMPED = 'stumped',
  CAUGHT_AND_BOWLED = 'caught_and_bowled',
  HIT_WICKET = 'hit_wicket',
  RETIRED_HURT = 'retired_hurt',
}

@Entity('balls')
@Index(['inningsId'])
@Index(['matchId'])
@Index(['batsmanId'])
@Index(['bowlerId'])
export class Ball {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'over_number' })
  overNumber: number;

  @Column({ name: 'ball_number' })
  ballNumber: number;

  @Column({ default: 0 })
  runs: number;

  @Column({ name: 'extra_runs', default: 0 })
  extraRuns: number;

  @Column({ name: 'is_wide', default: false })
  isWide: boolean;

  @Column({ name: 'is_no_ball', default: false })
  isNoBall: boolean;

  @Column({ name: 'is_bye', default: false })
  isBye: boolean;

  @Column({ name: 'is_leg_bye', default: false })
  isLegBye: boolean;

  @Column({ name: 'is_wicket', default: false })
  isWicket: boolean;

  @Column({
    type: 'enum',
    enum: DismissalType,
    nullable: true,
  })
  wicketType: DismissalType;

  @Column({ name: 'innings_id', nullable: false })
  inningsId: string;

  @ManyToOne(() => Innings, (innings) => innings.balls)
  @JoinColumn({ name: 'innings_id' })
  innings: Innings;

  @Column({ name: 'match_id', nullable: false })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.balls)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'batsman_id', nullable: false })
  batsmanId: string;

  @Column({ name: 'bowler_id', nullable: false })
  bowlerId: string;

  @Column({ name: 'dismissed_player_id', nullable: true })
  dismissedPlayerId: string;

  @Column({ nullable: true })
  commentary: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
