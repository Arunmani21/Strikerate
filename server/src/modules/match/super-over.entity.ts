import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Match } from './match.entity';
import { Team } from '../team/team.entity';

export enum SuperOverStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum SuperOverType {
  STANDARD = 'standard',     // Traditional 6-ball super over
  TIE_BREAKER = 'tie_breaker',  // Additional super over if still tied
}

@Entity('super_overs')
@Index(['matchId'])
@Index(['teamABattingFirst'])
@Index(['status'])
export class SuperOver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.superOvers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'team_a_id' })
  teamAId: string;

  @ManyToOne(() => Team, (team) => team.superOversAsTeamA, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_a_id' })
  teamA: Team;

  @Column({ name: 'team_b_id' })
  teamBId: string;

  @ManyToOne(() => Team, (team) => team.superOversAsTeamB, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_b_id' })
  teamB: Team;

  @Column({
    type: 'enum',
    enum: SuperOverType,
    default: SuperOverType.STANDARD,
  })
  type: SuperOverType;

  @Column({
    type: 'enum',
    enum: SuperOverStatus,
    default: SuperOverStatus.SCHEDULED,
  })
  status: SuperOverStatus;

  @Column({ name: 'team_a_batting_first', default: false })
  teamABattingFirst: boolean;

  @Column({ name: 'toss_winner_team_id', nullable: true })
  tossWinnerTeamId: string;

  @Column({ name: 'toss_choice', nullable: true })
  tossChoice: string; // 'bat' or 'bowl'

  @Column({ name: 'current_over', default: 0 })
  currentOver: number;

  @Column({ name: 'current_ball', default: 0 })
  currentBall: number;

  @Column({ name: 'team_a_runs', default: 0 })
  teamARuns: number;

  @Column({ name: 'team_a_wickets', default: 0 })
  teamAWickets: number;

  @Column({ name: 'team_b_runs', default: 0 })
  teamBRuns: number;

  @Column({ name: 'team_b_wickets', default: 0 })
  teamBWickets: number;

  @Column({ name: 'target_runs', nullable: true })
  targetRuns: number;

  @Column({ name: 'won_by_team_id', nullable: true })
  wonByTeamId: string;

  @Column({ name: 'margin', nullable: true })
  margin: string; // e.g., '2 runs', '1 wicket'

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'super_over_number', default: 1 })
  superOverNumber: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'status_changed_at', nullable: true })
  statusChangedAt: Date;

  @Column({ name: 'status_changed_by', nullable: true })
  statusChangedBy: string;
}
