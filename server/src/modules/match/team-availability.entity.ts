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
import { Team } from '../team/team.entity';

@Entity('team_availability')
@Index(['teamId'])
@Index(['matchId'])
@Index(['userId'])
export class TeamAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Date-based availability (original fields)
  @Column({ name: 'available_date', type: 'date', nullable: true })
  availableDate: Date;

  @Column({ name: 'available_from', type: 'time', nullable: true })
  availableFrom: string;

  @Column({ name: 'available_until', type: 'time', nullable: true })
  availableUntil: string;

  // Match-based availability (new fields)
  @Column({ name: 'match_id', nullable: true })
  matchId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string; // For personal availability

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  venue: string;

  @Column({ name: 'preferred_overs', nullable: true, type: 'integer' })
  preferredOvers: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_open', default: true })
  isOpen: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'posted_by', nullable: false })
  postedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
