import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Playing11 } from './playing11.entity';
import { Match } from '../match/match.entity';
import { Player } from '../player/player.entity';
import { PlayerAvailability } from '../player/player-availability.entity';
import { TeamMember } from '../team/team-member.entity';
import { TeamRole } from '../team/team-roles';
import { GuestPlayer } from '../player/guest-player.entity';
import { Team } from '../team/team.entity';
import { SelectPlaying11Dto } from './dto/select-playing11.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';

@Injectable()
export class Playing11Service {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private cricketGateway: CricketGateway,
  ) {}

  async selectPlaying11(
    matchId: string,
    teamId: string,
    userId: string,
    dto: SelectPlaying11Dto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const playing11Repository = queryRunner.manager.getRepository(Playing11);
      const matchRepository = queryRunner.manager.getRepository(Match);
      const playerRepository = queryRunner.manager.getRepository(Player);
      const playerAvailabilityRepository = queryRunner.manager.getRepository(
        PlayerAvailability,
      );
      const teamMemberRepository = queryRunner.manager.getRepository(TeamMember);
      const guestPlayerRepository = queryRunner.manager.getRepository(GuestPlayer);

      // Verify match exists and belongs to the team
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.teamAId !== teamId && match.teamBId !== teamId) {
        throw new BadRequestException('Team is not part of this match');
      }

      // Verify user is captain/manager of the team
      const teamMember = await teamMemberRepository.findOne({
        where: { userId, teamId },
      });

      if (!teamMember || (teamMember.role !== TeamRole.CAPTAIN && teamMember.role !== TeamRole.VICE_CAPTAIN)) {
        throw new BadRequestException('Only captain or vice-captain can select playing 11');
      }

      // Calculate total players (regular + guest)
      const regularPlayerCount = dto.playerIds?.length || 0;
      const guestPlayerCount = dto.guestPlayerIds?.length || 0;
      const totalPlayers = regularPlayerCount + guestPlayerCount;

      if (totalPlayers !== 11) {
        throw new BadRequestException(
          `Exactly 11 players must be selected. You have selected ${totalPlayers} players (${regularPlayerCount} regular + ${guestPlayerCount} guest)`,
        );
      }

      // Verify all regular players exist and belong to the team
      if (dto.playerIds && dto.playerIds.length > 0) {
        const players = await playerRepository.find({
          where: dto.playerIds.map((id) => ({ id })),
        });

        if (players.length !== dto.playerIds.length) {
          throw new BadRequestException('Some regular players do not exist');
        }

        // Verify all players belong to the same team
        const invalidPlayers = players.filter((p) => p.teamId !== teamId);
        if (invalidPlayers.length > 0) {
          throw new BadRequestException('All regular players must belong to the same team');
        }

        // Check player availability for the match date (only for regular players)
        // node-postgres returns DATE columns as 'YYYY-MM-DD' strings; new Date() normalizes both shapes
        const matchDate = new Date(match.matchDate).toISOString().split('T')[0];
        const availabilities = await playerAvailabilityRepository
          .createQueryBuilder('pa')
          .where('pa.playerId IN (:...playerIds)', { playerIds: dto.playerIds })
          .andWhere('pa.availableDate = :matchDate', { matchDate: new Date(matchDate) })
          .getMany();

        const unavailablePlayers = availabilities
          .filter((a) => !a.isAvailable)
          .map((a) => a.playerId);

        if (unavailablePlayers.length > 0) {
          // Get names of unavailable players
          const unavailablePlayerEntities = await playerRepository.find({
            where: unavailablePlayers.map((id) => ({ id })),
          });
          const unavailableNames = unavailablePlayerEntities.map((p) => p.name);
          throw new BadRequestException(
            `The following players are not available on this date: ${unavailableNames.join(', ')}`,
          );
        }
      }

      // DUAL ROLE CHECK: Verify no player is already in playing 11 for the other team
      const otherTeamId = match.teamAId === teamId ? match.teamBId : match.teamAId;
      const existingPlaying11ForOtherTeam = await playing11Repository
        .createQueryBuilder('playing11')
        .where('playing11.matchId = :matchId', { matchId })
        .andWhere('playing11.teamId = :otherTeamId', { otherTeamId })
        .getMany();

      if (existingPlaying11ForOtherTeam.length > 0) {
        const otherTeamPlayerIds = existingPlaying11ForOtherTeam
          .filter((p) => !p.isGuest) // Only check regular players, not guests
          .map((p) => p.playerId);

        // Check if any of our selected players are already in the other team's playing 11
        const conflictingPlayers = dto.playerIds?.filter((id) =>
          otherTeamPlayerIds.includes(id),
        );

        if (conflictingPlayers && conflictingPlayers.length > 0) {
          const conflictingPlayerEntities = await playerRepository.find({
            where: conflictingPlayers.map((id) => ({ id })),
          });
          const conflictingNames = conflictingPlayerEntities.map((p) => p.name);
          throw new BadRequestException(
            `The following players are already in Playing 11 for the opposing team: ${conflictingNames.join(', ')}. A player cannot play for both teams in the same match.`,
          );
        }
      }

      // Verify all guest players exist and belong to the team
      if (dto.guestPlayerIds && dto.guestPlayerIds.length > 0) {
        const guestPlayers = await guestPlayerRepository.find({
          where: dto.guestPlayerIds.map((id) => ({ id })),
        });

        if (guestPlayers.length !== dto.guestPlayerIds.length) {
          throw new BadRequestException('Some guest players do not exist');
        }

        // Verify all guest players belong to the same team
        const invalidGuests = guestPlayers.filter((p) => p.teamId !== teamId);
        if (invalidGuests.length > 0) {
          throw new BadRequestException('All guest players must belong to the same team');
        }

        // Verify guest players are active
        const inactiveGuests = guestPlayers.filter((p) => p.status !== 'active');
        if (inactiveGuests.length > 0) {
          const inactiveNames = inactiveGuests.map((p) => p.name);
          throw new BadRequestException(
            `The following guest players are not active: ${inactiveNames.join(', ')}`,
          );
        }
      }

      // Delete existing playing 11 for this team and match (allow redo)
      await playing11Repository.delete({
        matchId,
        teamId,
      });

      // Create playing 11 records for regular players
      const playing11Records = [];

      if (dto.playerIds && dto.playerIds.length > 0) {
        const regularPlayerRecords = dto.playerIds.map((playerId) =>
          playing11Repository.create({
            matchId,
            teamId,
            playerId,
            isGuest: false,
            selectedBy: userId,
          }),
        );
        playing11Records.push(...regularPlayerRecords);
      }

      // Create playing 11 records for guest players
      if (dto.guestPlayerIds && dto.guestPlayerIds.length > 0) {
        const guestPlayerRecords = dto.guestPlayerIds.map((guestPlayerId) =>
          playing11Repository.create({
            matchId,
            teamId,
            playerId: null, // Guest players don't have a player record
            isGuest: true,
            guestPlayerId,
            selectedBy: userId,
          }),
        );
        playing11Records.push(...guestPlayerRecords);
      }

      await playing11Repository.save(playing11Records);

      await queryRunner.commitTransaction();

      const [scoringTeam, selectedRegulars, selectedGuests] = await Promise.all([
        this.dataSource.getRepository(Team).findOne({ where: { id: teamId } }),
        dto.playerIds?.length
          ? this.dataSource.getRepository(Player).find({ where: dto.playerIds.map((id) => ({ id })) })
          : Promise.resolve([]),
        dto.guestPlayerIds?.length
          ? this.dataSource.getRepository(GuestPlayer).find({ where: dto.guestPlayerIds.map((id) => ({ id })) })
          : Promise.resolve([]),
      ]);

      this.cricketGateway.emitPlaying11Updated(matchId, {
        teamId,
        teamName: scoringTeam?.name || '',
        players: [
          ...selectedRegulars.map((p) => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber })),
          ...selectedGuests.map((g) => ({ id: g.id, name: g.name })),
        ],
      });

      return {
        matchId,
        teamId,
        regularPlayers: dto.playerIds || [],
        guestPlayers: dto.guestPlayerIds || [],
        totalPlayers,
        message: 'Playing 11 selected successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPlaying11(matchId: string, teamId: string) {
    const playing11Repository = this.dataSource.getRepository(Playing11);

    const playing11 = await playing11Repository.find({
      where: { matchId, teamId },
      relations: ['player', 'guestPlayer'],
    });

    if (playing11.length === 0) {
      throw new NotFoundException('Playing 11 not found for this team');
    }

    return playing11.map((p) => {
      if (p.isGuest && p.guestPlayer) {
        // Return guest player information
        return {
          id: p.guestPlayer.id,
          name: p.guestPlayer.name,
          isGuest: true,
          mobile: p.guestPlayer.mobile,
          battingStyle: p.guestPlayer.battingStyle,
          bowlingStyle: p.guestPlayer.bowlingStyle,
          role: p.guestPlayer.role,
        };
      } else if (p.player) {
        // Return regular player information
        return {
          id: p.player.id,
          name: p.player.name,
          isGuest: false,
          jerseyNumber: p.player.jerseyNumber,
        };
      }
      return null;
    }).filter(p => p !== null);
  }

  async getPlaying11Status(matchId: string) {
    const playing11Repository = this.dataSource.getRepository(Playing11);
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const teamACount = await playing11Repository.count({
      where: { matchId, teamId: match.teamAId },
    });

    const teamBCount = await playing11Repository.count({
      where: { matchId, teamId: match.teamBId },
    });

    return {
      matchId,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      teamACount,
      teamBCount,
      teamASelected: teamACount === 11,
      teamBSelected: teamBCount === 11,
      bothTeamsSelected: teamACount === 11 && teamBCount === 11,
      readyToStart: teamACount === 11 && teamBCount === 11,
    };
  }
}
