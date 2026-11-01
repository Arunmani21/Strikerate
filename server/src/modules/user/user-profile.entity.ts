import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

export enum UserRole {
  BATSMAN = 'batsman',
  BOWLER = 'bowler',
  ALLROUNDER = 'allrounder',
  KEEPER = 'keeper',
}

export enum BattingStyle {
  RIGHT_HAND = 'right_hand',
  LEFT_HAND = 'left_hand',
}

export enum BowlingStyle {
  RIGHT_ARM_FAST = 'right_arm_fast',
  RIGHT_ARM_SPIN = 'right_arm_spin',
  LEFT_ARM_FAST = 'left_arm_fast',
  LEFT_ARM_SPIN = 'left_arm_spin',
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: BattingStyle,
    nullable: true,
    name: 'batting_style',
  })
  battingStyle: BattingStyle;

  @Column({
    type: 'enum',
    enum: BowlingStyle,
    nullable: true,
    name: 'bowling_style',
  })
  bowlingStyle: BowlingStyle;

  @Column({ name: 'experience_years', nullable: true, type: 'integer' })
  experienceYears: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'user_id', unique: true, nullable: false })
  userId: string;

  @OneToOne('User', 'profile')
  @JoinColumn({ name: 'user_id' })
  user: any;
}
