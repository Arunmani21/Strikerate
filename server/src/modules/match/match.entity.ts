import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Team } from '../team/team.entity';
import { MatchRequest } from './match-request.entity';
import { Innings } from '../innings/innings.entity';
import { Ball } from '../scoring/ball.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { TeamMatchHistory } from '../stats/team-match-history.entity';
import { SuperOver } from './super-over.entity';

export enum MatchFormat {
  TEST = 'TEST',
  ODI = 'ODI',
  T20 = 'T20',
  T10 = 'T10',
}

export enum MatchStatus {
  // Pre-match statuses
  SCHEDULED = 'scheduled',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',

  // In-match statuses
  TOSS_DONE = 'toss_done',
  LIVE = 'live',
  INNINGS_BREAK = 'innings_break',
  RAIN_DELAYED = 'rain_delayed',
  BAD_LIGHT_DELAYED = 'bad_light_delayed',
  UMPIRE_DECISION_PENDING = 'umpire_decision_pending',

  // Post-match statuses
  COMPLETED = 'completed',
  TIED = 'tied',
  DRAW = 'draw',
  ABANDONED = 'abandoned',
  NO_RESULT = 'no_result',
}

export enum TossDecision {
  BAT = 'bat',
  BOWL = 'bowl',
}

@Entity('matches')
@Index(['status'])
@Index(['teamAId'])
@Index(['teamBId'])
@Index(['matchRequestId'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'total_overs', nullable: false })
  totalOvers: number;

  @Column({ nullable: true })
  venue: string;

  @Column({ name: 'match_date', type: 'date' })
  matchDate: Date;

  @Column({ name: 'match_time', type: 'time' })
  matchTime: string;

  @Column({ name: 'toss_winner_id', nullable: true })
  tossWinnerId: string;

  @Column({
    name: 'toss_choice',
    type: 'enum',
    enum: TossDecision,
    nullable: true,
  })
  tossChoice: TossDecision;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @Column({ name: 'current_innings', default: 1 })
  currentInnings: number;

  @Column({ default: 0 })
  target: number;

  @Column({ nullable: true })
  result: string;

  @Column({ name: 'winning_team_id', nullable: true })
  winningTeamId: string;

  @ManyToOne(() => Team, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winning_team_id' })
  winningTeam: Team;

  @Column({ name: 'margin_of_victory', nullable: true })
  marginOfVictory: string;

  @Column({ name: 'margin_type', nullable: true })
  marginType: string; // runs, wickets, etc.

  @Column({ name: 'status_changed_at', nullable: true })
  statusChangedAt: Date;

  @Column({ name: 'status_changed_by', nullable: true })
  statusChangedBy: string;

  @Column({ name: 'abandonment_reason', nullable: true })
  abandonmentReason: string;

  @Column({ name: 'abandonment_details', nullable: true })
  abandonmentDetails: string;

  @Column({ name: 'weather_conditions', nullable: true })
  weatherConditions: string;

  @Column({ name: 'overs_bowled', nullable: true })
  oversBowled: number;

  @Column({ name: 'total_overs_bowled', nullable: true })
  totalOversBowled: number;

  @Column({ name: 'team_a_id', nullable: false })
  teamAId: string;

  @ManyToOne(() => Team, (team) => team.homeMatches)
  @JoinColumn({ name: 'team_a_id' })
  teamA: Team;

  @Column({ name: 'team_b_id', nullable: false })
  teamBId: string;

  @ManyToOne(() => Team, (team) => team.awayMatches)
  @JoinColumn({ name: 'team_b_id' })
  teamB: Team;

  @Column({ name: 'created_by', nullable: false })
  createdBy: string;

  @Column({ name: 'match_request_id', nullable: true })
  matchRequestId: string;

  @ManyToOne(() => MatchRequest, (request) => request.matches)
  @JoinColumn({ name: 'match_request_id' })
  matchRequest: MatchRequest;

  @OneToMany(() => Innings, (innings) => innings.match)
  innings: Innings[];

  @OneToMany(() => Ball, (ball) => ball.match)
  balls: Ball[];

  @OneToMany(() => Playing11, (playing11) => playing11.match)
  playing11: Playing11[];

  @OneToMany(() => PlayerMatchPerformance, (performance) => performance.match)
  performances: PlayerMatchPerformance[];

  @OneToMany(() => TeamMatchHistory, (history) => history.match)
  teamHistory: TeamMatchHistory[];

  @OneToMany(() => SuperOver, (superOver) => superOver.match)
  superOvers: SuperOver[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
