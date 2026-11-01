import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { Team } from '../team/team.entity';
import { MatchPermissionService } from '../../common/match-permission.service';
import {
  UpdateMatchStatusDto,
  AbandonMatchDto,
  CompleteMatchDto,
  DeclareMatchTiedDto,
  DeclareMatchDrawDto,
  DelayMatchDto,
  ResumeMatchDto,
  PostponeMatchDto,
  CancelMatchDto,
} from './dto/match-status.dto';

@Injectable()
export class MatchStatusService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly matchPermission: MatchPermissionService,
  ) {}

  /**
   * Main status update method with transition validation
   */
  async updateMatchStatus(
    matchId: string,
    dto: UpdateMatchStatusDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);
      const teamRepository = queryRunner.manager.getRepository(Team);

      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Validate status transition
      this.validateStatusTransition(match.status, dto.status);

      // Update match status
      match.status = dto.status;
      match.statusChangedAt = new Date();
      match.statusChangedBy = userId;

      // Handle status-specific logic
      if (dto.winningTeamId) {
        const winningTeam = await teamRepository.findOne({
          where: { id: dto.winningTeamId },
        });
        if (!winningTeam) {
          throw new NotFoundException('Winning team not found');
        }
        match.winningTeamId = dto.winningTeamId;
      }

      if (dto.marginOfVictory) {
        match.marginOfVictory = dto.marginOfVictory;
      }

      if (dto.marginType) {
        match.marginType = dto.marginType;
      }

      if (dto.weatherConditions) {
        match.weatherConditions = dto.weatherConditions;
      }

      if (dto.oversBowled) {
        match.oversBowled = dto.oversBowled;
      }

      if (dto.totalOversBowled) {
        match.totalOversBowled = dto.totalOversBowled;
      }

      const savedMatch = await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return {
        match: savedMatch,
        message: `Match status updated to ${dto.status}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Abandon match (rain, bad light, etc.)
   */
  async abandonMatch(
    matchId: string,
    dto: AbandonMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);

      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      await this.matchPermission.assertCanManage(matchId, userId);

      // Can only abandon live or delayed matches
      if (
        match.status !== MatchStatus.LIVE &&
        match.status !== MatchStatus.RAIN_DELAYED &&
        match.status !== MatchStatus.BAD_LIGHT_DELAYED &&
        match.status !== MatchStatus.INNINGS_BREAK &&
        match.status !== MatchStatus.SCHEDULED
      ) {
        throw new BadRequestException(
          `Cannot abandon match with status ${match.status}`,
        );
      }

      // Update match as abandoned
      match.status = MatchStatus.ABANDONED;
      match.statusChangedAt = new Date();
      match.statusChangedBy = userId;
      match.abandonmentReason = dto.reason;
      match.abandonmentDetails = dto.details;
      match.weatherConditions = dto.weatherConditions;
      match.oversBowled = dto.oversBowled;
      match.totalOversBowled = dto.totalOvers || match.totalOvers;

      const savedMatch = await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return {
        match: savedMatch,
        message: `Match abandoned due to ${dto.reason}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Complete match with result
   */
  async completeMatch(
    matchId: string,
    dto: CompleteMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);
      const teamRepository = queryRunner.manager.getRepository(Team);

      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      await this.matchPermission.assertCanManage(matchId, userId);

      // Can only complete live matches or innings break
      if (
        match.status !== MatchStatus.LIVE &&
        match.status !== MatchStatus.INNINGS_BREAK
      ) {
        throw new BadRequestException(
          `Cannot complete match with status ${match.status}`,
        );
      }

      // Validate winning team
      const winningTeam = await teamRepository.findOne({
        where: { id: dto.winningTeamId },
      });
      if (!winningTeam) {
        throw new NotFoundException('Winning team not found');
      }

      // Verify winning team is actually playing in this match
      if (
        match.teamAId !== dto.winningTeamId &&
        match.teamBId !== dto.winningTeamId
      ) {
        throw new BadRequestException(
          'Winning team must be one of the teams playing this match',
        );
      }

      // Update match as completed
      match.status = MatchStatus.COMPLETED;
      match.winningTeamId = dto.winningTeamId;
      match.marginOfVictory = `${dto.margin} ${dto.victoryType}`;
      match.marginType = dto.victoryType;
      match.statusChangedAt = new Date();
      match.statusChangedBy = userId;

      if (dto.resultDescription) {
        match.result = dto.resultDescription;
      } else {
        // Always store a result string — stats calculation and the UI read it
        match.result = `${winningTeam.name} won by ${dto.margin} ${dto.victoryType}`;
      }

      const savedMatch = await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return {
        match: savedMatch,
        message: `Match completed. ${winningTeam.name} won by ${dto.margin} ${dto.victoryType}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Declare match as tied
   */
  async declareMatchTied(
    matchId: string,
    dto: DeclareMatchTiedDto,
    userId: string,
  ): Promise<{ match: Match; message: string; canPlaySuperOver: boolean }> {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.matchPermission.assertCanManage(matchId, userId);

    // Can only declare tie for live matches or innings break
    if (
      match.status !== MatchStatus.LIVE &&
      match.status !== MatchStatus.INNINGS_BREAK
    ) {
      throw new BadRequestException(
        `Cannot declare tie for match with status ${match.status}`,
      );
    }

    // Update match as tied
    match.status = MatchStatus.TIED;
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;
    match.result = dto.description || 'Match tied';

    const savedMatch = await matchRepository.save(match);

    return {
      match: savedMatch,
      message: 'Match declared as tied. You can now choose to play a super over or declare as draw.',
      canPlaySuperOver: true, // Indicates super over is available
    };
  }

  /**
   * Declare match as draw (Test matches)
   */
  async declareMatchDraw(
    matchId: string,
    dto: DeclareMatchDrawDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.matchPermission.assertCanManage(matchId, userId);

    // Can only declare draw for live matches or innings break
    if (
      match.status !== MatchStatus.LIVE &&
      match.status !== MatchStatus.INNINGS_BREAK
    ) {
      throw new BadRequestException(
        `Cannot declare draw for match with status ${match.status}`,
      );
    }

    // Update match as draw
    match.status = MatchStatus.DRAW;
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;
    match.result = dto.description || 'Match drawn';
    match.abandonmentDetails = dto.reason;

    const savedMatch = await matchRepository.save(match);

    return {
      match: savedMatch,
      message: 'Match declared as drawn',
    };
  }

  /**
   * Delay match (rain, bad light, etc.)
   */
  async delayMatch(
    matchId: string,
    dto: DelayMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.matchPermission.assertCanManage(matchId, userId);

    // Can only delay live matches
    if (match.status !== MatchStatus.LIVE) {
      throw new BadRequestException(
        `Cannot delay match with status ${match.status}`,
      );
    }

    // Update match to delayed status
    const delayStatus =
      dto.delayType === 'rain'
        ? MatchStatus.RAIN_DELAYED
        : MatchStatus.BAD_LIGHT_DELAYED;

    match.status = delayStatus;
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;
    match.weatherConditions = dto.weatherConditions;
    match.abandonmentDetails = dto.description;

    const savedMatch = await matchRepository.save(match);

    return {
      match: savedMatch,
      message: `Match delayed due to ${dto.delayType}. Expected to resume in ${dto.estimatedDuration} minutes`,
    };
  }

  /**
   * Resume match after delay
   */
  async resumeMatch(
    matchId: string,
    dto: ResumeMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.matchPermission.assertCanManage(matchId, userId);

    // Can only resume delayed matches
    if (
      match.status !== MatchStatus.RAIN_DELAYED &&
      match.status !== MatchStatus.BAD_LIGHT_DELAYED
    ) {
      throw new BadRequestException(
        `Cannot resume match with status ${match.status}`,
      );
    }

    // Update match back to live
    match.status = MatchStatus.LIVE;
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;

    const savedMatch = await matchRepository.save(match);

    return {
      match: savedMatch,
      message: `Match resumed${dto.timeLost ? ` after ${dto.timeLost} minutes delay` : ''}`,
    };
  }

  /**
   * Postpone match (before it starts)
   */
  async postponeMatch(
    matchId: string,
    dto: PostponeMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);

      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      await this.matchPermission.assertCanManage(matchId, userId);

      // Can only postpone scheduled matches
      if (match.status !== MatchStatus.SCHEDULED) {
        throw new BadRequestException(
          `Cannot postpone match with status ${match.status}`,
        );
      }

      // Update match to postponed
      match.status = MatchStatus.POSTPONED;
      match.statusChangedAt = new Date();
      match.statusChangedBy = userId;
      match.abandonmentReason = dto.reason;
      match.abandonmentDetails = `Rescheduled to ${dto.rescheduledDate} at ${dto.rescheduledTime}`;

      // Update match date and time (optional - you might want to create new match)
      // For now, we'll just store the reschedule info in abandonmentDetails

      const savedMatch = await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return {
        match: savedMatch,
        message: `Match postponed to ${dto.rescheduledDate} at ${dto.rescheduledTime}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cancel match (before it starts)
   */
  async cancelMatch(
    matchId: string,
    dto: CancelMatchDto,
    userId: string,
  ): Promise<{ match: Match; message: string }> {
    const matchRepository = this.dataSource.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.matchPermission.assertCanManage(matchId, userId);

    // Can only cancel scheduled matches
    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot cancel match with status ${match.status}`,
      );
    }

    // Update match to cancelled
    match.status = MatchStatus.CANCELLED;
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;
    match.abandonmentReason = 'cancelled';
    match.abandonmentDetails = dto.reason;

    const savedMatch = await matchRepository.save(match);

    return {
      match: savedMatch,
      message: 'Match cancelled successfully',
    };
  }

  /**
   * Get matches by status
   */
  async getMatchesByStatus(status: MatchStatus): Promise<Match[]> {
    const matchRepository = this.dataSource.getRepository(Match);

    return await matchRepository.find({
      where: { status },
      relations: ['teamA', 'teamB', 'winningTeam'],
      order: { matchDate: 'DESC', matchTime: 'DESC' },
    });
  }

  /**
   * Get live matches
   */
  async getLiveMatches(): Promise<Match[]> {
    return await this.getMatchesByStatus(MatchStatus.LIVE);
  }

  /**
   * Get upcoming matches
   */
  async getUpcomingMatches(): Promise<Match[]> {
    return await this.getMatchesByStatus(MatchStatus.SCHEDULED);
  }

  /**
   * Get completed matches
   */
  async getCompletedMatches(): Promise<Match[]> {
    const matchRepository = this.dataSource.getRepository(Match);

    return await matchRepository.find({
      where: { status: MatchStatus.COMPLETED },
      relations: ['teamA', 'teamB', 'winningTeam'],
      order: { matchDate: 'DESC', matchTime: 'DESC' },
    });
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: MatchStatus,
    newStatus: MatchStatus,
  ): void {
    const validTransitions: Record<MatchStatus, MatchStatus[]> = {
      [MatchStatus.SCHEDULED]: [
        MatchStatus.POSTPONED,
        MatchStatus.CANCELLED,
        MatchStatus.TOSS_DONE,
        MatchStatus.LIVE,
      ],
      [MatchStatus.TOSS_DONE]: [MatchStatus.LIVE, MatchStatus.CANCELLED],
      [MatchStatus.LIVE]: [
        MatchStatus.COMPLETED,
        MatchStatus.TIED,
        MatchStatus.DRAW,
        MatchStatus.ABANDONED,
        MatchStatus.RAIN_DELAYED,
        MatchStatus.BAD_LIGHT_DELAYED,
        MatchStatus.INNINGS_BREAK,
        MatchStatus.NO_RESULT,
        MatchStatus.UMPIRE_DECISION_PENDING,
      ],
      [MatchStatus.INNINGS_BREAK]: [
        MatchStatus.LIVE,
        MatchStatus.COMPLETED,
        MatchStatus.TIED,
        MatchStatus.DRAW,
        MatchStatus.ABANDONED,
        MatchStatus.NO_RESULT,
      ],
      [MatchStatus.RAIN_DELAYED]: [
        MatchStatus.LIVE,
        MatchStatus.ABANDONED,
        MatchStatus.POSTPONED,
        MatchStatus.NO_RESULT,
      ],
      [MatchStatus.BAD_LIGHT_DELAYED]: [
        MatchStatus.LIVE,
        MatchStatus.ABANDONED,
        MatchStatus.POSTPONED,
        MatchStatus.NO_RESULT,
      ],
      [MatchStatus.UMPIRE_DECISION_PENDING]: [
        MatchStatus.LIVE,
        MatchStatus.ABANDONED,
        MatchStatus.NO_RESULT,
      ],
      [MatchStatus.COMPLETED]: [], // Final state
      [MatchStatus.TIED]: [], // Final state
      [MatchStatus.DRAW]: [], // Final state
      [MatchStatus.ABANDONED]: [], // Final state
      [MatchStatus.POSTPONED]: [MatchStatus.SCHEDULED], // Can be rescheduled
      [MatchStatus.CANCELLED]: [], // Final state
      [MatchStatus.NO_RESULT]: [], // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`,
      );
    }
  }
}
