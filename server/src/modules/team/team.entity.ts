import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Player } from '../player/player.entity';
import { TeamAvailability } from '../match/team-availability.entity';
import { Match } from '../match/match.entity';
import { MatchRequest } from '../match/match-request.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { TeamMatchHistory } from '../stats/team-match-history.entity';
import { SuperOver } from '../match/super-over.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'home_ground', nullable: true })
  homeGround: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'captain_id', nullable: false })
  captainId: string;

  @Column({ name: 'created_by', nullable: false })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date; // Soft delete - team deleted but historical data preserved

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members: TeamMember[];

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @OneToMany(() => TeamAvailability, (availability) => availability.team)
  availabilities: TeamAvailability[];

  @OneToMany(() => Match, (match) => match.teamA)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.teamB)
  awayMatches: Match[];

  @OneToMany(() => MatchRequest, (request) => request.requestingTeam)
  sentRequests: MatchRequest[];

  @OneToMany(() => MatchRequest, (request) => request.opponentTeam)
  receivedRequests: MatchRequest[];

  @OneToMany(() => Playing11, (playing11) => playing11.team)
  playing11: Playing11[];

  @OneToMany(() => PlayerMatchPerformance, (performance) => performance.team)
  performances: PlayerMatchPerformance[];

  @OneToMany(() => TeamMatchHistory, (history) => history.team)
  matchHistory: TeamMatchHistory[];

  @OneToMany(() => SuperOver, (superOver) => superOver.teamA)
  superOversAsTeamA: SuperOver[];

  @OneToMany(() => SuperOver, (superOver) => superOver.teamB)
  superOversAsTeamB: SuperOver[];
}
