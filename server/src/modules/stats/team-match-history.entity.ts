import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Team } from '../team/team.entity';
import { Match } from '../match/match.entity';

@Entity('team_match_history')
@Index(['teamId'])
@Index(['matchId'])
@Index(['matchDate'])
export class TeamMatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  result: string; // 'won', 'lost', 'tied', 'abandoned'

  @Column({ name: 'runs_scored', default: 0 })
  runsScored: number;

  @Column({ name: 'wickets_lost', default: 0 })
  wicketsLost: number;

  @Column({ name: 'overs_played', type: 'decimal', precision: 5, scale: 2, default: 0 })
  oversPlayed: number;

  @Column({ name: 'runs_conceded', default: 0 })
  runsConceded: number;

  @Column({ name: 'wickets_taken', default: 0 })
  wicketsTaken: number;

  @Column({ type: 'date' })
  matchDate: Date;

  @Column({ name: 'team_id', nullable: false })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.matchHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'match_id', nullable: false })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.teamHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'opponent_id', type: 'uuid', nullable: false })
  opponentId: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opponent_id' })
  opponent: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
