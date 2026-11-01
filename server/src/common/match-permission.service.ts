import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Match } from '../modules/match/match.entity';
import { TeamMember } from '../modules/team/team-member.entity';
import { TeamRole } from '../modules/team/team-roles';

/**
 * Shared authorization for match-level mutations: only a captain or
 * vice-captain of one of the two teams playing the match may manage it
 * (status changes, super over, stats calculation, player of the match).
 */
@Injectable()
export class MatchPermissionService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async canManage(matchId: string, userId: string): Promise<boolean> {
    const match = await this.dataSource
      .getRepository(Match)
      .findOne({ where: { id: matchId } });
    if (!match) return false;

    const membership = await this.dataSource
      .getRepository(TeamMember)
      .findOne({
        where: [
          { userId, teamId: match.teamAId },
          { userId, teamId: match.teamBId },
        ],
      });

    if (!membership) return false;
    return (
      membership.role === TeamRole.CAPTAIN ||
      membership.role === TeamRole.VICE_CAPTAIN
    );
  }

  async assertCanManage(matchId: string, userId: string): Promise<void> {
    const allowed = await this.canManage(matchId, userId);
    if (!allowed) {
      throw new ForbiddenException(
        'Only a captain or vice-captain of either team can perform this action',
      );
    }
  }
}
