import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Team } from '../team/team.entity';
import { TeamAvailability } from './team-availability.entity';
import { MatchRequest, MatchRequestStatus } from './match-request.entity';
import { Match, MatchStatus } from './match.entity';
import { TeamAvailabilityDto } from './dto/team-availability.dto';
import { MatchRequestDto, RespondRequestDto } from './dto/match-request.dto';
import { TossDto } from './dto/toss.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';

@Injectable()
export class MatchService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private cricketGateway: CricketGateway,
  ) {}

  async postTeamAvailability(teamId: string, userId: string, dto: TeamAvailabilityDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teamAvailabilityRepository = queryRunner.manager.getRepository(TeamAvailability);

      // Verify user is captain/manager of the team
      const teamMemberRepository = queryRunner.manager.getRepository('TeamMember');
      const teamMember = await teamMemberRepository.findOne({
        where: { userId, teamId },
      });

      if (!teamMember || (teamMember.role !== 'captain' && teamMember.role !== 'vice_captain' && teamMember.role !== 'manager')) {
        throw new BadRequestException('Only captain, vice-captain, or manager can post team availability');
      }

      // Create team availability
      const availability = teamAvailabilityRepository.create({
        teamId,
        postedBy: userId,
        availableDate: new Date(dto.availableDate),
        availableFrom: dto.availableFrom,
        availableUntil: dto.availableUntil,
        venue: dto.venue,
        preferredOvers: dto.preferredOvers,
        notes: dto.notes,
        isOpen: dto.isOpen !== undefined ? dto.isOpen : true,
      });

      const savedAvailability = await teamAvailabilityRepository.save(availability);

      await queryRunner.commitTransaction();

      return savedAvailability;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAvailableTeams(date: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const teamAvailabilityRepository = queryRunner.manager.getRepository(TeamAvailability);

      const targetDate = new Date(date);

      // Get all team availabilities for the date
      const availabilities = await teamAvailabilityRepository.find({
        where: { availableDate: targetDate, isOpen: true },
        relations: ['team'],
      });

      return availabilities.map((av) => ({
        id: av.team.id,
        name: av.team.name,
        captainId: av.team.captainId,
        availableFrom: av.availableFrom,
        availableUntil: av.availableUntil,
        venue: av.venue,
        preferredOvers: av.preferredOvers,
        notes: av.notes,
        availabilityId: av.id,
      }));
    } finally {
      await queryRunner.release();
    }
  }

  async sendMatchRequest(teamId: string, userId: string, dto: MatchRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRequestRepository = queryRunner.manager.getRepository(MatchRequest);
      const teamAvailabilityRepository = queryRunner.manager.getRepository(TeamAvailability);
      const teamRepository = queryRunner.manager.getRepository(Team);

      // Verify user is captain of requesting team
      const team = await teamRepository.findOne({
        where: { id: teamId },
      });

      if (!team || team.captainId !== userId) {
        throw new BadRequestException('Only captain can send match requests');
      }

      // Check opponent team availability for that date
      const opponentAvailability = await teamAvailabilityRepository.findOne({
        where: {
          teamId: dto.opponentTeamId,
          availableDate: new Date(dto.matchDate),
          isOpen: true,
        },
      });

      if (!opponentAvailability) {
        throw new BadRequestException('Opponent team is not available on this date');
      }

      // Check no pending request exists between same teams same date
      const existingRequest = await matchRequestRepository.findOne({
        where: {
          requestingTeamId: teamId,
          opponentTeamId: dto.opponentTeamId,
          matchDate: new Date(dto.matchDate),
          status: MatchRequestStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new ConflictException('A pending request already exists between these teams for this date');
      }

      // Create match request
      const matchRequest = matchRequestRepository.create({
        requestingTeamId: teamId,
        opponentTeamId: dto.opponentTeamId,
        matchDate: new Date(dto.matchDate),
        matchTime: dto.matchTime,
        venue: dto.venue || opponentAvailability.venue,
        preferredOvers: dto.preferredOvers,
        requestedBy: userId,
        status: MatchRequestStatus.PENDING,
      });

      const savedRequest = await matchRequestRepository.save(matchRequest);

      await queryRunner.commitTransaction();

      return savedRequest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTeamMatchRequests(teamId: string, userId: string) {
    // Verify the caller is a member of the team
    const teamMemberRepository = this.dataSource.getRepository('TeamMember');
    const membership = await teamMemberRepository.findOne({
      where: { userId, teamId },
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this team');
    }

    const matchRequestRepository = this.dataSource.getRepository(MatchRequest);

    return matchRequestRepository.find({
      where: [{ requestingTeamId: teamId }, { opponentTeamId: teamId }],
      relations: ['requestingTeam', 'opponentTeam'],
      order: { createdAt: 'DESC' },
    });
  }

  async respondToMatchRequest(requestId: string, userId: string, dto: RespondRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRequestRepository = queryRunner.manager.getRepository(MatchRequest);
      const matchRepository = queryRunner.manager.getRepository(Match);
      const teamAvailabilityRepository = queryRunner.manager.getRepository(TeamAvailability);

      // Get match request
      const matchRequest = await matchRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!matchRequest) {
        throw new NotFoundException('Match request not found');
      }

      // Verify user is captain of opponent team
      if (matchRequest.status !== MatchRequestStatus.PENDING) {
        throw new BadRequestException('This match request has already been responded to');
      }

      const teamRepository = queryRunner.manager.getRepository(Team);
      const team = await teamRepository.findOne({
        where: { id: matchRequest.opponentTeamId },
      });

      if (!team || team.captainId !== userId) {
        throw new BadRequestException('Only opponent captain can respond to match request');
      }

      if (dto.status === 'confirmed') {
        // Create match
        const match = matchRepository.create({
          teamAId: matchRequest.requestingTeamId,
          teamBId: matchRequest.opponentTeamId,
          matchDate: matchRequest.matchDate,
          matchTime: matchRequest.matchTime,
          totalOvers: matchRequest.preferredOvers || 20,
          venue: matchRequest.venue,
          matchRequestId: matchRequest.id,
          createdBy: userId,
          status: MatchStatus.SCHEDULED,
        });

        const savedMatch = await matchRepository.save(match);

        // Set both team availabilities to closed
        await teamAvailabilityRepository.update(
          {
            teamId: matchRequest.requestingTeamId,
            availableDate: matchRequest.matchDate,
          },
          { isOpen: false },
        );

        await teamAvailabilityRepository.update(
          {
            teamId: matchRequest.opponentTeamId,
            availableDate: matchRequest.matchDate,
          },
          { isOpen: false },
        );

        // Update request status
        matchRequest.status = MatchRequestStatus.CONFIRMED;
        matchRequest.respondedAt = new Date();
        matchRequest.respondedBy = userId;
        await matchRequestRepository.save(matchRequest);

        await queryRunner.commitTransaction();

        return savedMatch;
      } else {
        // Rejected
        matchRequest.status = MatchRequestStatus.REJECTED;
        matchRequest.respondedAt = new Date();
        matchRequest.respondedBy = userId;
        await matchRequestRepository.save(matchRequest);

        await queryRunner.commitTransaction();

        return { message: 'Match request rejected' };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async recordToss(matchId: string, userId: string, dto: TossDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);

      // Get match
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status !== MatchStatus.SCHEDULED) {
        throw new BadRequestException('Toss can only be recorded for scheduled matches');
      }

      // Verify userId is captain of either team
      if (dto.tossWinnerId !== match.teamAId && dto.tossWinnerId !== match.teamBId) {
        throw new BadRequestException('Toss winner must be one of the match teams');
      }

      const teamRepository = queryRunner.manager.getRepository(Team);
      const team = await teamRepository.findOne({
        where: { id: dto.tossWinnerId },
      });

      if (!team || team.captainId !== userId) {
        throw new BadRequestException('Only captain can record toss for their team');
      }

      // Update match
      match.tossWinnerId = dto.tossWinnerId;
      match.tossChoice = dto.tossChoice;
      match.status = MatchStatus.TOSS_DONE;
      await matchRepository.save(match);

      await queryRunner.commitTransaction();

      const tossTeams = await this.dataSource.getRepository(Team).find({
        where: [{ id: match.teamAId }, { id: match.teamBId }],
      });
      const tossTeamName = (teamId: string) =>
        tossTeams.find(t => t.id === teamId)?.name || '';

      this.cricketGateway.emitTossResult(matchId, {
        tossWinner: {
          id: match.tossWinnerId!,
          name: tossTeamName(match.tossWinnerId!),
        },
        tossChoice: match.tossChoice,
        teamA: { id: match.teamAId, name: tossTeamName(match.teamAId) },
        teamB: { id: match.teamBId, name: tossTeamName(match.teamBId) },
      });

      return match;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMatch(matchId: string) {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({
      where: { id: matchId },
      relations: ['teamA', 'teamB'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async getLiveMatches() {
    const matchRepository = this.dataSource.getRepository(Match);

    const matches = await matchRepository.find({
      where: [{ status: MatchStatus.LIVE }, { status: MatchStatus.TOSS_DONE }],
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'ASC', matchTime: 'ASC' },
    });

    return matches;
  }

  async getUpcomingMatches(teamId: string) {
    const matchRepository = this.dataSource.getRepository(Match);

    const matches = await matchRepository.find({
      where: [
        { status: MatchStatus.SCHEDULED },
        { teamAId: teamId },
      ],
      relations: ['teamA', 'teamB', 'matchRequest'],
      order: { matchDate: 'ASC', matchTime: 'ASC' },
    });

    return matches;
  }
}
