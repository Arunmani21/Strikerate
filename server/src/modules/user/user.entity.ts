import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { TeamMember } from '../team/team-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  // Nullable: Google-only accounts have no password (they sign in via Google).
  @Column({ nullable: true })
  password: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'mobile', nullable: true })
  mobile: string;

  @Column({ name: 'mobile_verified', default: false })
  mobileVerified: boolean;

  @Column({ name: 'mobile_verified_at', nullable: true })
  mobileVerifiedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Inverse side: the FK lives on user_profiles.user_id (owned by
  // UserProfile). A @JoinColumn here would claim ownership and make TypeORM
  // join on a nonexistent users.profileId, so the profile would always
  // load as null.
  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, {
    cascade: true,
    eager: false,
  })
  profile?: UserProfile;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMembers: TeamMember[];
}
