import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TeamRole, TeamPermission, hasPermission, canManageRole } from './team-roles';
import {
  UpdateTeamDetailsDto,
  UpdateMemberRoleDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
  UpdateTeamAvailabilityDto,
  UpdatePersonalAvailabilityDto,
  SetCaptainDto,
} from './dto/team-management.dto';

@Injectable()
export class TeamManagementService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Get user's role in a team
   */
  async getUserRole(teamId: string, userId: string): Promise<TeamMember | null> {
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);

    const teamMember = await teamMemberRepository.findOne({
      where: { teamId, userId, isActive: true },
    });

    return teamMember;
  }

  /**
   * Check if user has permission to perform action on team
   */
  async checkPermission(
    teamId: string,
    userId: string,
    requiredPermission: TeamPermission,
  ): Promise<boolean> {
    const teamMember = await this.getUserRole(teamId, userId);

    if (!teamMember) {
      return false;
    }

    return hasPermission(teamMember.role, requiredPermission);
  }

  /**
   * Update team details
   * Only CAPTAIN can update team details
   */
  async updateTeamDetails(
    teamId: string,
    dto: UpdateTeamDetailsDto,
    userId: string,
  ): Promise<{ team: Team; message: string }> {
    // Check permission
    const hasUpdatePermission = await this.checkPermission(
      teamId,
      userId,
      TeamPermission.UPDATE_TEAM_DETAILS,
    );

    if (!hasUpdatePermission) {
      throw new ForbiddenException(
        'You do not have permission to update team details. Only CAPTAIN can update team details.',
      );
    }

    const teamRepository = this.dataSource.getRepository(Team);
    const team = await teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Update team details
    if (dto.name) team.name = dto.name;
    if (dto.homeGround) team.homeGround = dto.homeGround;
    if (dto.description) team.description = dto.description;
    if (dto.logoUrl) team.logoUrl = dto.logoUrl;

    const updatedTeam = await teamRepository.save(team);

    return {
      team: updatedTeam,
      message: 'Team details updated successfully',
    };
  }

  /**
   * Update team member role
   * Only CAPTAIN can update member roles
   * CAPTAIN can assign VICE_CAPTAIN role to other members
   */
  async updateMemberRole(
    teamId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
    userId: string,
  ): Promise<{ teamMember: TeamMember; message: string }> {
    // Get current user's role
    const currentMember = await this.getUserRole(teamId, userId);
    if (!currentMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check permission
    if (!hasPermission(currentMember.role, TeamPermission.UPDATE_MEMBER_ROLES)) {
      throw new ForbiddenException(
        'You do not have permission to update member roles. Only CAPTAIN can update member roles.',
      );
    }

    // Check if can manage the target role
    if (!canManageRole(currentMember.role, dto.role)) {
      throw new ForbiddenException(
        `You cannot assign ${dto.role.toUpperCase()} role. You can only assign roles with lower or equal hierarchy level.`,
      );
    }

    // Get target member
    const targetMember = await this.getUserRole(teamId, targetUserId);
    if (!targetMember) {
      throw new NotFoundException('Target user is not a member of this team');
    }

    // Cannot modify owner or someone with higher role
    if (!canManageRole(currentMember.role, targetMember.role)) {
      throw new ForbiddenException(
        'You cannot modify the role of someone with higher or equal hierarchy level',
      );
    }

    // Cannot demote yourself if you're the only captain
    if (targetUserId === userId && currentMember.role === TeamRole.CAPTAIN) {
      const captainCount = await this.dataSource.getRepository(TeamMember).count({
        where: { teamId, role: TeamRole.CAPTAIN, isActive: true },
      });

      if (captainCount <= 1) {
        throw new BadRequestException(
          'Cannot demote yourself as you are the only captain. Assign another captain first.',
        );
      }
    }

    // Update role
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);
    targetMember.role = dto.role;
    targetMember.roleUpdatedAt = new Date();
    targetMember.roleUpdatedBy = userId;

    const updatedMember = await teamMemberRepository.save(targetMember);

    return {
      teamMember: updatedMember,
      message: `Member role updated to ${dto.role.toUpperCase()}`,
    };
  }

  /**
   * Add member to team
   * Only CAPTAIN and VICE_CAPTAIN can add members
   */
  async addTeamMember(
    teamId: string,
    dto: AddTeamMemberDto,
    userId: string,
  ): Promise<{ teamMember: TeamMember; message: string }> {
    // Check permission
    const hasAddPermission = await this.checkPermission(
      teamId,
      userId,
      TeamPermission.ADD_MEMBERS,
    );

    if (!hasAddPermission) {
      throw new ForbiddenException(
        'You do not have permission to add members. Only CAPTAIN and VICE_CAPTAIN can add members.',
      );
    }

    // Check if user exists
    const userRepository = this.dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { id: dto.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);
    const existingMember = await teamMemberRepository.findOne({
      where: { teamId, userId: dto.userId },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new BadRequestException('User is already a member of this team');
      } else {
        // Reactivate inactive member
        existingMember.isActive = true;
        existingMember.role = dto.role;
        existingMember.joinedAt = new Date();
        existingMember.jerseyNumber = dto.jerseyNumber;
        existingMember.battingStyle = dto.battingStyle;
        existingMember.bowlingStyle = dto.bowlingStyle;
        existingMember.playerType = dto.playerType;

        const reactivatedMember = await teamMemberRepository.save(existingMember);

        return {
          teamMember: reactivatedMember,
          message: 'Member reactivated successfully',
        };
      }
    }

    // Check if assigning higher role than current user's role
    const currentMember = await this.getUserRole(teamId, userId);
    if (currentMember && !canManageRole(currentMember.role, dto.role)) {
      throw new ForbiddenException(
        `You cannot add members with ${dto.role.toUpperCase()} role. You can only assign roles with lower or equal hierarchy level.`,
      );
    }

    // Create new team member
    const teamMember = teamMemberRepository.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
      jerseyNumber: dto.jerseyNumber,
      battingStyle: dto.battingStyle,
      bowlingStyle: dto.bowlingStyle,
      playerType: dto.playerType,
      isActive: true,
    });

    const savedMember = await teamMemberRepository.save(teamMember);

    return {
      teamMember: savedMember,
      message: `Member added to team as ${dto.role.toUpperCase()}`,
    };
  }

  /**
   * Remove member from team
   * Only CAPTAIN and VICE_CAPTAIN can remove members
   * Captain succession: When Captain is removed, Vice-Captain automatically becomes Captain
   */
  async removeTeamMember(
    teamId: string,
    dto: RemoveTeamMemberDto,
    userId: string,
  ): Promise<{ message: string }> {
    // Check permission
    const hasRemovePermission = await this.checkPermission(
      teamId,
      userId,
      TeamPermission.REMOVE_MEMBERS,
    );

    if (!hasRemovePermission) {
      throw new ForbiddenException(
        'You do not have permission to remove members. Only CAPTAIN and VICE_CAPTAIN can remove members.',
      );
    }

    // Get target member
    const targetMember = await this.getUserRole(teamId, dto.userId);
    if (!targetMember) {
      throw new NotFoundException('User is not a member of this team');
    }

    // Get current user's role
    const currentMember = await this.getUserRole(teamId, userId);
    if (!currentMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Cannot remove owner or someone with higher role
    if (!canManageRole(currentMember.role, targetMember.role)) {
      throw new ForbiddenException(
        'You cannot remove members with higher or equal hierarchy level',
      );
    }

    // Cannot remove yourself if you're the only captain
    if (dto.userId === userId && currentMember.role === TeamRole.CAPTAIN) {
      const captainCount = await this.dataSource.getRepository(TeamMember).count({
        where: { teamId, role: TeamRole.CAPTAIN, isActive: true },
      });

      if (captainCount <= 1) {
        throw new BadRequestException(
          'Cannot remove yourself as you are the only captain. Assign another captain first.',
        );
      }
    }

    // Soft remove member (set isActive to false)
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);
    targetMember.isActive = false;

    await teamMemberRepository.save(targetMember);

    // Captain succession logic: If removed member was captain, promote vice-captain to captain
    if (targetMember.role === TeamRole.CAPTAIN) {
      const viceCaptain = await teamMemberRepository.findOne({
        where: { teamId, role: TeamRole.VICE_CAPTAIN, isActive: true },
      });

      if (viceCaptain) {
        viceCaptain.role = TeamRole.CAPTAIN;
        await teamMemberRepository.save(viceCaptain);

        return {
          message: 'Member removed from team successfully. Vice-captain has been promoted to captain.',
        };
      }
    }

    return {
      message: 'Member removed from team successfully',
    };
  }

  /**
   * Set captain and vice-captain
   * Only CAPTAIN can set captain/vice-captain
   */
  async setCaptain(
    teamId: string,
    dto: SetCaptainDto,
    userId: string,
  ): Promise<{ message: string }> {
    // Check permission
    const hasPermission = await this.checkPermission(
      teamId,
      userId,
      TeamPermission.UPDATE_MEMBER_ROLES,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to set captain. Only CAPTAIN can set captain.',
      );
    }

    const teamMemberRepository = this.dataSource.getRepository(TeamMember);

    // Remove existing captain
    await teamMemberRepository.update(
      { teamId, role: TeamRole.CAPTAIN },
      { role: TeamRole.PLAYER },
    );

    // Remove existing vice-captain
    await teamMemberRepository.update(
      { teamId, role: TeamRole.VICE_CAPTAIN },
      { role: TeamRole.PLAYER },
    );

    // Set new captain
    const captain = await teamMemberRepository.findOne({
      where: { teamId, userId: dto.captainId, isActive: true },
    });

    if (!captain) {
      throw new NotFoundException('Captain user is not a member of this team');
    }

    captain.role = TeamRole.CAPTAIN;
    await teamMemberRepository.save(captain);

    // Set vice-captain if provided
    if (dto.viceCaptainId) {
      const viceCaptain = await teamMemberRepository.findOne({
        where: { teamId, userId: dto.viceCaptainId, isActive: true },
      });

      if (!viceCaptain) {
        throw new NotFoundException(
          'Vice-captain user is not a member of this team',
        );
      }

      viceCaptain.role = TeamRole.VICE_CAPTAIN;
      await teamMemberRepository.save(viceCaptain);
    }

    return {
      message: 'Captain and vice-captain set successfully',
    };
  }

  /**
   * Update team availability for a match
   * CAPTAIN and VICE_CAPTAIN can set team availability
   */
  async updateTeamAvailability(
    teamId: string,
    dto: UpdateTeamAvailabilityDto,
    userId: string,
  ): Promise<{ message: string }> {
    // Check permission
    const hasPermission = await this.checkPermission(
      teamId,
      userId,
      TeamPermission.SET_TEAM_AVAILABILITY,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to set team availability. Only CAPTAIN and VICE_CAPTAIN can set team availability.',
      );
    }

    // Check if match exists
    const matchRepository = this.dataSource.getRepository('Match');
    const match = await matchRepository.findOne({ where: { id: dto.matchId } });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Check if team is playing in this match
    if (match.teamAId !== teamId && match.teamBId !== teamId) {
      throw new BadRequestException('Your team is not playing in this match');
    }

    // Create or update team availability
    const availabilityRepository = this.dataSource.getRepository('TeamAvailability');

    const existingAvailability = await availabilityRepository.findOne({
      where: { matchId: dto.matchId, teamId },
    });

    if (existingAvailability) {
      existingAvailability.isAvailable = dto.isAvailable;
      existingAvailability.notes = dto.notes;
      await availabilityRepository.save(existingAvailability);
    } else {
      const availability = availabilityRepository.create({
        matchId: dto.matchId,
        teamId,
        isAvailable: dto.isAvailable,
        notes: dto.notes,
        metadata: dto.details,
      });
      await availabilityRepository.save(availability);
    }

    return {
      message: `Team availability updated to ${dto.isAvailable ? 'available' : 'unavailable'}`,
    };
  }

  /**
   * Update personal availability for a match
   * All members can update their own availability
   *
   * DUAL ROLE RESTRICTION: A player cannot be available for both teams in the same match
   */
  async updatePersonalAvailability(
    teamId: string,
    dto: UpdatePersonalAvailabilityDto,
    userId: string,
  ): Promise<{ message: string }> {
    // Check if user is a member
    const teamMember = await this.getUserRole(teamId, userId);
    if (!teamMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check if match exists
    const matchRepository = this.dataSource.getRepository('Match');
    const match = await matchRepository.findOne({ where: { id: dto.matchId } });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Check if team is playing in this match
    if (match.teamAId !== teamId && match.teamBId !== teamId) {
      throw new BadRequestException('Your team is not playing in this match');
    }

    // DUAL ROLE CHECK: If trying to mark as available, check if already available for other team
    if (dto.isAvailable) {
      const otherTeamId = match.teamAId === teamId ? match.teamBId : match.teamAId;

      // Check if user is a member of the other team
      const otherTeamMembership = await this.getUserRole(otherTeamId, userId);
      if (otherTeamMembership) {
        // User is a member of both teams! Check if they're already available for the other team
        const availabilityRepository = this.dataSource.getRepository('TeamAvailability');
        const otherTeamAvailability = await availabilityRepository.findOne({
          where: {
            matchId: dto.matchId,
            teamId: otherTeamId,
            userId,
            isAvailable: true,
          },
        });

        if (otherTeamAvailability) {
          throw new BadRequestException(
            `You are already available for the other team in this match. A player cannot be available for both teams in the same match.`,
          );
        }
      }
    }

    // Create or update personal availability
    const availabilityRepository = this.dataSource.getRepository('TeamAvailability');

    const existingAvailability = await availabilityRepository.findOne({
      where: { matchId: dto.matchId, teamId, userId },
    });

    if (existingAvailability) {
      existingAvailability.isAvailable = dto.isAvailable;
      existingAvailability.notes = dto.reason;
      await availabilityRepository.save(existingAvailability);
    } else {
      const availability = availabilityRepository.create({
        matchId: dto.matchId,
        teamId,
        userId,
        isAvailable: dto.isAvailable,
        notes: dto.reason,
        metadata: dto.details,
      });
      await availabilityRepository.save(availability);
    }

    return {
      message: `Your availability updated to ${dto.isAvailable ? 'available' : 'unavailable'}`,
    };
  }

  /**
   * Get team members with their roles
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);

    return await teamMemberRepository.find({
      where: { teamId, isActive: true },
      relations: ['user'],
      order: { role: 'ASC', joinedAt: 'ASC' },
    });
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<any> {
    // Implementation for team statistics
    const matchRepository = this.dataSource.getRepository('Match');

    const totalMatches = await matchRepository.count({
      where: [{ teamAId: teamId }, { teamBId: teamId }],
    });

    const wonMatches = await matchRepository.count({
      where: [
        { teamAId: teamId, winningTeamId: teamId },
        { teamBId: teamId, winningTeamId: teamId },
      ],
    });

    return {
      totalMatches,
      wonMatches,
      lostMatches: totalMatches - wonMatches,
      winPercentage: totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0,
    };
  }
}
