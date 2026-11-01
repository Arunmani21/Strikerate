import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from '../team/team.entity';
import { Match } from '../match/match.entity';

export enum GuestPlayerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('guest_players')
@Index(['teamId'])
@Index(['matchId'])
@Index(['mobile'])
export class GuestPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'match_id', nullable: true })
  matchId: string;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column()
  name: string;

  @Column({ name: 'mobile', nullable: true })
  mobile: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: GuestPlayerStatus,
    default: GuestPlayerStatus.ACTIVE,
  })
  status: GuestPlayerStatus;

  @Column({ name: 'batting_style', nullable: true })
  battingStyle: string;

  @Column({ name: 'bowling_style', nullable: true })
  bowlingStyle: string;

  @Column({ name: 'role', nullable: true })
  role: string; // batsman, bowler, allrounder, wicketkeeper

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Store additional info like temporary notes

  @Column({ name: 'is_converted', default: false })
  isConverted: boolean; // If guest was later converted to regular player

  @Column({ name: 'converted_player_id', nullable: true })
  convertedPlayerId: string; // ID of regular player if converted

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'added_by' })
  addedBy: string; // User ID who added this guest player
}
