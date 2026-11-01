import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { Player } from './player.entity';
import { PlayerAvailability } from './player-availability.entity';
import { TeamMember } from '../team/team-member.entity';
import { TeamRole } from '../team/team-roles';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerAvailabilityDto } from './dto/player-availability.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async addPlayer(teamId: string, dto: CreatePlayerDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const playerRepository = queryRunner.manager.getRepository(Player);
      const teamMemberRepository = queryRunner.manager.getRepository(TeamMember);

      // Check if player name already exists in this team
      const existingPlayer = await playerRepository.findOne({
        where: { name: dto.name, teamId },
      });

      if (existingPlayer) {
        throw new ConflictException(`Player '${dto.name}' already exists in this team`);
      }

      // If userId provided, check if user exists and add to team_members
      if (dto.userId) {
        const existingTeamMember = await teamMemberRepository.findOne({
          where: { userId: dto.userId, teamId },
        });

        if (existingTeamMember) {
          throw new ConflictException('User is already a member of this team');
        }

        // Add user to team_members as player
        const teamMember = teamMemberRepository.create({
          teamId,
          userId: dto.userId,
          role: TeamRole.PLAYER,
        });

        await teamMemberRepository.save(teamMember);
      }

      // Create player
      const player = playerRepository.create({
        teamId,
        name: dto.name.trim(),
        jerseyNumber: dto.jerseyNumber,
        userId: dto.userId,
      });

      const savedPlayer = await playerRepository.save(player);

      await queryRunner.commitTransaction();

      return savedPlayer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removePlayer(teamId: string, playerId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const playerRepository = queryRunner.manager.getRepository(Player);

      // Check if player exists and belongs to team
      const player = await playerRepository.findOne({
        where: { id: playerId, teamId },
      });

      if (!player) {
        throw new NotFoundException('Player not found in this team');
      }

      // Check if player is in any live match playing11
      // Note: We'll implement this check when we create the playing11 module
      // For now, we'll skip this check but include a TODO comment

      // TODO: Check if player is in any live match playing11
      // If player is in live match, throw BadRequestException

      // Delete player
      await playerRepository.remove(player);

      await queryRunner.commitTransaction();

      return { message: 'Player removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTeamPlayers(teamId: string) {
    const playerRepository = this.dataSource.getRepository(Player);

    const players = await playerRepository.find({
      where: { teamId },
      order: { name: 'ASC' },
    });

    return players;
  }

  async getAvailablePlayers(teamId: string, date: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const playerRepository = queryRunner.manager.getRepository(Player);
      const availabilityRepository = queryRunner.manager.getRepository(PlayerAvailability);

      // Parse the date
      const availableDate = new Date(date);

      // Get all players in team
      const players = await playerRepository.find({
        where: { teamId },
      });

      // Get availability for the specific date
      const playerIds = players.map((p) => p.id);
      const availabilities = await availabilityRepository.find({
        where: {
          playerId: In(playerIds),
          availableDate,
        },
      });

      // Create a map for quick lookup
      const availabilityMap = new Map();
      availabilities.forEach((av) => {
        availabilityMap.set(av.playerId, av.isAvailable);
      });

      // Combine player data with availability
      const playersWithAvailability = players.map((player) => ({
        ...player,
        isAvailable: availabilityMap.has(player.id)
          ? availabilityMap.get(player.id)
          : true, // Default to available if no record exists
      }));

      // Filter only available players
      const availablePlayers = playersWithAvailability.filter(
        (p) => p.isAvailable,
      );

      return availablePlayers;
    } finally {
      await queryRunner.release();
    }
  }

  async setPlayerAvailability(userId: string, dto: UpdatePlayerAvailabilityDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const playerRepository = queryRunner.manager.getRepository(Player);
      const availabilityRepository = queryRunner.manager.getRepository(
        PlayerAvailability,
      );
      const teamMemberRepository = queryRunner.manager.getRepository(TeamMember);

      // Verify player belongs to user OR requester is captain/manager
      const player = await playerRepository.findOne({
        where: { id: dto.playerId },
      });

      if (!player) {
        throw new NotFoundException('Player not found');
      }

      // Check if user owns this player OR is captain/manager of the team
      const isOwner = player.userId === userId;
      let hasTeamPermission = false;

      if (!isOwner) {
        // Check if user is captain/manager of the player's team
        const teamMember = await teamMemberRepository.findOne({
          where: { userId, teamId: player.teamId },
        });

        if (teamMember && (teamMember.role === TeamRole.CAPTAIN || teamMember.role === TeamRole.VICE_CAPTAIN)) {
          hasTeamPermission = true;
        }
      }

      if (!isOwner && !hasTeamPermission) {
        throw new BadRequestException(
          'You can only set availability for yourself or your team members (if captain/manager)',
        );
      }

      // Upsert availability
      const existingAvailability = await availabilityRepository.findOne({
        where: {
          playerId: dto.playerId,
          availableDate: new Date(dto.availableDate),
        },
      });

      if (existingAvailability) {
        // Update existing
        Object.assign(existingAvailability, {
          isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : existingAvailability.isAvailable,
          reason: dto.reason !== undefined ? dto.reason : existingAvailability.reason,
        });

        await availabilityRepository.save(existingAvailability);
      } else {
        // Create new
        const availability = availabilityRepository.create({
          playerId: dto.playerId,
          userId,
          availableDate: new Date(dto.availableDate),
          isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
          reason: dto.reason,
        });

        await availabilityRepository.save(availability);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Player availability updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
