import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  MOBILE_VERIFICATION = 'mobile_verification',
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  USED = 'used',
}

@Entity('otps')
@Index(['userId'])
@Index(['email'])
@Index(['mobile'])
@Index(['otp'])
@Index(['type'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'mobile', nullable: true })
  mobile: string;

  @Column()
  otp: string;

  @Column({
    type: 'enum',
    enum: OtpType,
    default: OtpType.EMAIL_VERIFICATION,
  })
  type: OtpType;

  @Column({
    type: 'enum',
    enum: OtpStatus,
    default: OtpStatus.PENDING,
  })
  status: OtpStatus;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'attempts', default: 0 })
  attempts: number;

  @Column({ name: 'max_attempts', default: 3 })
  maxAttempts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}