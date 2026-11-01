import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Team } from './team.entity';
import { TeamRole } from './team-roles';
import { User } from '../user/user.entity';

@Entity('team_members')
@Unique(['teamId', 'userId'])
@Index(['teamId', 'role'])
@Index(['userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.PLAYER,
  })
  role: TeamRole;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'jersey_number', nullable: true })
  jerseyNumber: number;

  @Column({ name: 'batting_style', nullable: true })
  battingStyle: string; // 'right-handed', 'left-handed'

  @Column({ name: 'bowling_style', nullable: true })
  bowlingStyle: string; // 'right-arm fast', 'left-arm spin', etc.

  @Column({ name: 'player_type', default: 'all-rounder' })
  playerType: string; // 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'role_updated_at', nullable: true })
  roleUpdatedAt: Date;

  @Column({ name: 'role_updated_by', nullable: true })
  roleUpdatedBy: string;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.teamMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_active', default: true })
  isActive: boolean; // Soft delete for team members
}
