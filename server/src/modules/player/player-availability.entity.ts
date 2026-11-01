import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_availability')
@Unique(['playerId', 'availableDate'])
@Index(['playerId'])
@Index(['availableDate'])
export class PlayerAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'available_date', type: 'date' })
  availableDate: Date;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  reason: string;

  @Column({ name: 'player_id', nullable: false })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'user_id', nullable: true })
  userId: string;
}
