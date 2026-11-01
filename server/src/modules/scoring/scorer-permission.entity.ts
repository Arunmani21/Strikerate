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
import { User } from '../user/user.entity';

export enum ScorerRole {
  PRIMARY_SCORER = 'primary_scorer',
  SECONDARY_SCORER = 'secondary_scorer',
  TEMPORARY_SCORER = 'temporary_scorer',
  VIEWER = 'viewer',
}

export enum TransferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
}

@Entity('scorer_permissions')
@Index(['matchId'])
@Index(['userId'])
@Index(['transferredFrom'])
@Index(['transferredTo'])
export class ScorerPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ScorerRole,
    default: ScorerRole.VIEWER,
  })
  role: ScorerRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'can_score', default: false })
  canScore: boolean;

  @Column({ name: 'transferred_from', nullable: true })
  transferredFrom: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transferred_from' })
  transferredFromUser: User;

  @Column({ name: 'transferred_to', nullable: true })
  transferredTo: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transferred_to' })
  transferredToUser: User;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  transferStatus: TransferStatus;

  @Column({ name: 'transferred_at', nullable: true })
  transferredAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;

  @Column({ name: 'transfer_reason', nullable: true })
  transferReason: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
