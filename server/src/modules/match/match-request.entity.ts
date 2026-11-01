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
import { Match } from './match.entity';

export enum MatchRequestStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('match_requests')
@Index(['requestingTeamId'])
@Index(['opponentTeamId'])
@Index(['status'])
@Index(['matchDate'])
export class MatchRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_date', type: 'date' })
  matchDate: Date;

  @Column({ name: 'match_time', type: 'time' })
  matchTime: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ name: 'preferred_overs', nullable: true, type: 'integer' })
  preferredOvers: number;

  @Column({
    type: 'enum',
    enum: MatchRequestStatus,
    default: MatchRequestStatus.PENDING,
  })
  status: MatchRequestStatus;

  @Column({ name: 'responded_at', nullable: true })
  respondedAt: Date;

  @Column({ name: 'requesting_team_id', nullable: false })
  requestingTeamId: string;

  @ManyToOne(() => Team, (team) => team.sentRequests)
  @JoinColumn({ name: 'requesting_team_id' })
  requestingTeam: Team;

  @Column({ name: 'opponent_team_id', nullable: false })
  opponentTeamId: string;

  @ManyToOne(() => Team, (team) => team.receivedRequests)
  @JoinColumn({ name: 'opponent_team_id' })
  opponentTeam: Team;

  @Column({ name: 'requested_by', nullable: false })
  requestedBy: string;

  @Column({ name: 'responded_by', nullable: true })
  respondedBy: string;

  @OneToMany(() => Match, (match) => match.matchRequest)
  matches: Match[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
