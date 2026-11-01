import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { TeamRole } from './team-roles';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class TeamPermissionGuard implements CanActivate {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get team ID from route parameters
    const teamId = request.params.teamId || request.params.id;

    if (!teamId) {
      throw new NotFoundException('Team ID not found in request');
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Check user's role in this team
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);
    const teamMember = await teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!teamMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // If no specific roles required, just being a member is enough
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has required role
    if (!requiredRoles.includes(teamMember.role)) {
      throw new ForbiddenException(
        `You need ${requiredRoles.join(' or ')} role to perform this action`,
      );
    }

    // Attach team member to request for use in controllers
    request.teamMember = teamMember;

    return true;
  }
}
