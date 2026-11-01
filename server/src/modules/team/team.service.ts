import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TeamRole } from './team-roles';
import { CreateTeamDto } from './dto/create-team.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createTeam(userId: string, dto: CreateTeamDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teamRepository = queryRunner.manager.getRepository(Team);
      const teamMemberRepository = queryRunner.manager.getRepository(
        TeamMember,
      );

      // Check team name unique
      const existingTeam = await teamRepository.findOne({
        where: { name: dto.name },
      });

      if (existingTeam) {
        throw new ConflictException('Team name already exists');
      }

      // Create team with user as captain
      const team = teamRepository.create({
        name: dto.name,
        captainId: userId,
        createdBy: userId,
      });

      const savedTeam = await teamRepository.save(team);

      // Add creator as captain in team_members
      const teamMember = teamMemberRepository.create({
        teamId: savedTeam.id,
        userId: userId,
        role: TeamRole.CAPTAIN,
      });

      await teamMemberRepository.save(teamMember);

      await queryRunner.commitTransaction();

      return savedTeam;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTeam(teamId: string) {
    const teamRepository = this.dataSource.getRepository(Team);

    const team = await teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async getMyTeams(userId: string) {
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);

    const teamMembers = await teamMemberRepository.find({
      where: { userId },
      relations: ['team'],
    });

    // Filter out any null teams and return array of teams
    return teamMembers
      .map((tm) => tm.team)
      .filter((team) => team !== null);
  }

  async transferCaptaincy(
    teamId: string,
    currentCaptainId: string,
    dto: AssignRoleDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teamRepository = queryRunner.manager.getRepository(Team);
      const teamMemberRepository = queryRunner.manager.getRepository(
        TeamMember,
      );

      // Verify requester is current captain
      const team = await teamRepository.findOne({
        where: { id: teamId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      if (team.captainId !== currentCaptainId) {
        throw new BadRequestException(
          'Only current captain can transfer captaincy',
        );
      }

      // Find new captain in team_members
      const newCaptainMember = await teamMemberRepository.findOne({
        where: { teamId, userId: dto.userId },
      });

      if (!newCaptainMember) {
        throw new NotFoundException('User is not a member of this team');
      }

      // Update old captain role to player
      const oldCaptainMember = await teamMemberRepository.findOne({
        where: { teamId, userId: currentCaptainId },
      });

      if (oldCaptainMember) {
        oldCaptainMember.role = TeamRole.PLAYER;
        await teamMemberRepository.save(oldCaptainMember);
      }

      // Update new captain role
      newCaptainMember.role = TeamRole.CAPTAIN;
      await teamMemberRepository.save(newCaptainMember);

      // Update team captain_id
      team.captainId = dto.userId;
      await teamRepository.save(team);

      await queryRunner.commitTransaction();

      return team;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignViceCaptain(
    teamId: string,
    captainId: string,
    dto: AssignRoleDto,
  ) {
    return this.assignRole(
      teamId,
      captainId,
      dto.userId,
      TeamRole.VICE_CAPTAIN,
    );
  }

  private async assignRole(
    teamId: string,
    captainId: string,
    targetUserId: string,
    role: TeamRole,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teamRepository = queryRunner.manager.getRepository(Team);
      const teamMemberRepository = queryRunner.manager.getRepository(
        TeamMember,
      );

      // Verify requester is captain
      const team = await teamRepository.findOne({
        where: { id: teamId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      if (team.captainId !== captainId) {
        throw new BadRequestException('Only captain can assign roles');
      }

      // Find target user in team_members
      const targetMember = await teamMemberRepository.findOne({
        where: { teamId, userId: targetUserId },
      });

      if (!targetMember) {
        throw new NotFoundException('User is not a member of this team');
      }

      // Remove existing role holder if any
      const existingRoleHolder = await teamMemberRepository.findOne({
        where: { teamId, role },
      });

      if (existingRoleHolder) {
        existingRoleHolder.role = TeamRole.PLAYER;
        await teamMemberRepository.save(existingRoleHolder);
      }

      // Assign new role
      targetMember.role = role;
      await teamMemberRepository.save(targetMember);

      await queryRunner.commitTransaction();

      return targetMember;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
