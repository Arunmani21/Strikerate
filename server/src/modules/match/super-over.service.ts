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
import { SuperOver, SuperOverStatus, SuperOverType } from './super-over.entity';
import {
  StartSuperOverDto,
  SuperOverBallDto,
  CompleteSuperOverDto,
  AbandonSuperOverDto,
  SuperOverStatusDto,
} from './dto/super-over.dto';

@Injectable()
export class SuperOverService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly matchPermission: MatchPermissionService,
  ) {}

  /**
   * Start a super over for a tied match
   */
  async startSuperOver(
    matchId: string,
    dto: StartSuperOverDto,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);
      const teamRepository = queryRunner.manager.getRepository(Team);
      const superOverRepository = queryRunner.manager.getRepository(SuperOver);

      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      await this.matchPermission.assertCanManage(matchId, userId);

      // Can only start super over for tied matches
      if (match.status !== MatchStatus.TIED) {
        throw new BadRequestException(
          `Cannot start super over for match with status ${match.status}. Match must be tied.`,
        );
      }

      // Check if teams exist
      const teamA = await teamRepository.findOne({ where: { id: match.teamAId } });
      const teamB = await teamRepository.findOne({ where: { id: match.teamBId } });

      if (!teamA || !teamB) {
        throw new NotFoundException('One or both teams not found');
      }

      // A super over left in_progress (its decider ball was rejected as "still
      // tied") must not linger once its successor is created.
      await superOverRepository.update(
        { matchId, status: SuperOverStatus.IN_PROGRESS },
        { status: SuperOverStatus.ABANDONED },
      );

      // Determine if this is a tie-breaker super over (subsequent super over)
      const existingSuperOvers = await superOverRepository.find({
        where: { matchId },
      });
      const superOverNumber = existingSuperOvers.length + 1;
      const type =
        superOverNumber > 1 ? SuperOverType.TIE_BREAKER : SuperOverType.STANDARD;

      // Validate toss winner
      if (
        dto.tossWinnerTeamId !== match.teamAId &&
        dto.tossWinnerTeamId !== match.teamBId
      ) {
        throw new BadRequestException(
          'Toss winner must be one of the teams playing this match',
        );
      }

      // Create super over
      const superOver = superOverRepository.create({
        matchId,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        type,
        status: SuperOverStatus.SCHEDULED,
        tossWinnerTeamId: dto.tossWinnerTeamId,
        tossChoice: dto.tossChoice,
        targetRuns: dto.targetRuns,
        superOverNumber,
        createdBy: userId,
        metadata: dto.metadata,
      });

      const savedSuperOver = await superOverRepository.save(superOver);

      // Update match status to indicate super over is scheduled
      match.status = MatchStatus.LIVE; // Match goes back to live for super over
      match.statusChangedAt = new Date();
      match.statusChangedBy = userId;
      await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return {
        superOver: savedSuperOver,
        message: `Super over ${superOverNumber} started. ${dto.tossChoice === 'bat' ? teamA.name : teamB.name} chose to ${dto.tossChoice} first`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Begin super over innings (sets batting order)
   */
  async beginSuperOverInnings(
    superOverId: string,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superOverRepository = queryRunner.manager.getRepository(SuperOver);

      const superOver = await superOverRepository.findOne({
        where: { id: superOverId },
      });
      if (!superOver) {
        throw new NotFoundException('Super over not found');
      }

      if (superOver.status !== SuperOverStatus.SCHEDULED) {
        throw new BadRequestException(
          `Cannot begin innings for super over with status ${superOver.status}`,
        );
      }

      await this.matchPermission.assertCanManage(superOver.matchId, userId);

      // Determine which team bats first based on toss
      let battingFirstTeamId: string;
      if (superOver.tossChoice === 'bat') {
        battingFirstTeamId = superOver.tossWinnerTeamId;
      } else {
        // Toss winner chose to bowl, so other team bats first
        battingFirstTeamId =
          superOver.tossWinnerTeamId === superOver.teamAId
            ? superOver.teamBId
            : superOver.teamAId;
      }

      superOver.teamABattingFirst =
        battingFirstTeamId === superOver.teamAId;
      superOver.status = SuperOverStatus.IN_PROGRESS;
      superOver.statusChangedAt = new Date();
      superOver.statusChangedBy = userId;

      const savedSuperOver = await superOverRepository.save(superOver);

      await queryRunner.commitTransaction();

      return {
        superOver: savedSuperOver,
        message: `Super over innings began. Team batting first: ${
          battingFirstTeamId === superOver.teamAId ? 'Team A' : 'Team B'
        }`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Record a ball in super over
   * CRITICAL: If batting team loses 2 wickets, innings ends immediately
   */
  async deliverSuperOverBall(
    superOverId: string,
    dto: SuperOverBallDto,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superOverRepository = queryRunner.manager.getRepository(SuperOver);

      const superOver = await superOverRepository.findOne({
        where: { id: superOverId },
      });
      if (!superOver) {
        throw new NotFoundException('Super over not found');
      }

      if (superOver.status !== SuperOverStatus.IN_PROGRESS) {
        throw new BadRequestException(
          `Cannot deliver ball for super over with status ${superOver.status}`,
        );
      }

      await this.matchPermission.assertCanManage(superOver.matchId, userId);

      // Determine which team is currently batting
      const isFirstTeamBatting =
        (superOver.teamABattingFirst && superOver.currentOver === 0) ||
        (!superOver.teamABattingFirst && superOver.currentOver === 1);

      let runsToAdd = dto.runs;
      let wicketsToAdd = 0;

      // Handle extras
      if (dto.isWide) {
        runsToAdd += 1; // Wide adds 1 run
        // Wide doesn't count as a ball bowled
      } else if (dto.isNoBall) {
        runsToAdd += 1; // No ball adds 1 run
        // No ball doesn't count as a ball bowled
      } else {
        // Valid ball, increment ball count
        superOver.currentBall += 1;
      }

      // Handle wickets
      if (dto.isWicket) {
        wicketsToAdd = 1;
      }

      // Update runs and wickets for current batting team
      if (isFirstTeamBatting) {
        if (superOver.teamABattingFirst) {
          superOver.teamARuns += runsToAdd;
          superOver.teamAWickets += wicketsToAdd;
        } else {
          superOver.teamBRuns += runsToAdd;
          superOver.teamBWickets += wicketsToAdd;
        }
      } else {
        // Second team batting
        if (superOver.teamABattingFirst) {
          superOver.teamBRuns += runsToAdd;
          superOver.teamBWickets += wicketsToAdd;
        } else {
          superOver.teamARuns += runsToAdd;
          superOver.teamAWickets += wicketsToAdd;
        }
      }

      // CRITICAL RULE: Check if innings should end (2 wickets lost or over complete)
      let inningsComplete = false;
      let reason = '';

      const currentWickets = isFirstTeamBatting
        ? superOver.teamABattingFirst
          ? superOver.teamAWickets
          : superOver.teamBWickets
        : superOver.teamABattingFirst
        ? superOver.teamBWickets
        : superOver.teamAWickets;

      const currentRuns = isFirstTeamBatting
        ? superOver.teamABattingFirst
          ? superOver.teamARuns
          : superOver.teamBRuns
        : superOver.teamABattingFirst
        ? superOver.teamBRuns
        : superOver.teamARuns;

      // Check for 2 wickets (innings ends immediately)
      if (currentWickets >= 2) {
        inningsComplete = true;
        reason = 'Innings complete - 2 wickets lost';
      }
      // Check if over complete (6 legal deliveries)
      else if (superOver.currentBall >= 6) {
        inningsComplete = true;
        reason = 'Over complete - 6 balls bowled';
      }
      // Check if target exceeded (only for second batting team)
      else if (!isFirstTeamBatting && superOver.targetRuns) {
        const firstTeamScore = superOver.teamABattingFirst
          ? superOver.teamARuns
          : superOver.teamBRuns;
        if (currentRuns > firstTeamScore) {
          inningsComplete = true;
          reason = 'Target exceeded - super over won';
        }
      }

      // If innings complete, switch to next team or complete super over
      if (inningsComplete) {
        if (isFirstTeamBatting) {
          // First team done, switch to second team
          superOver.currentOver = 1;
          superOver.currentBall = 0;
          superOver.targetRuns = currentRuns; // Set target for second team

          const savedSuperOver = await superOverRepository.save(superOver);
          await queryRunner.commitTransaction();

          return {
            superOver: savedSuperOver,
            message: `${reason}. Target set: ${currentRuns} runs. Next team to bat.`,
          };
        } else {
          // Second team done, complete the super over
          const winner = this.determineSuperOverWinner(superOver);
          superOver.status = SuperOverStatus.COMPLETED;
          superOver.wonByTeamId = winner.winningTeamId;
          superOver.margin = winner.margin;
          superOver.completedAt = new Date();

          const savedSuperOver = await superOverRepository.save(superOver);

          // Update match status based on super over result
          await this.updateMatchAfterSuperOver(
            queryRunner,
            superOver.matchId,
            winner.winningTeamId,
            userId,
          );

          await queryRunner.commitTransaction();

          return {
            superOver: savedSuperOver,
            message: `Super over completed. ${winner.resultMessage}`,
          };
        }
      }

      const savedSuperOver = await superOverRepository.save(superOver);
      await queryRunner.commitTransaction();

      return {
        superOver: savedSuperOver,
        message: `Ball recorded. Runs: ${runsToAdd}, Wickets: ${wicketsToAdd}`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Complete super over manually (for early completion scenarios)
   */
  async completeSuperOver(
    superOverId: string,
    dto: CompleteSuperOverDto,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superOverRepository = queryRunner.manager.getRepository(SuperOver);

      const superOver = await superOverRepository.findOne({
        where: { id: superOverId },
      });
      if (!superOver) {
        throw new NotFoundException('Super over not found');
      }

      if (superOver.status !== SuperOverStatus.IN_PROGRESS) {
        throw new BadRequestException(
          `Cannot complete super over with status ${superOver.status}`,
        );
      }

      await this.matchPermission.assertCanManage(superOver.matchId, userId);

      // Update super over as completed
      superOver.status = SuperOverStatus.COMPLETED;
      superOver.wonByTeamId = dto.winningTeamId;
      superOver.margin = dto.margin;
      superOver.completedAt = new Date();
      superOver.statusChangedAt = new Date();
      superOver.statusChangedBy = userId;

      if (dto.details) {
        superOver.metadata = { ...superOver.metadata, ...dto.details };
      }

      const savedSuperOver = await superOverRepository.save(superOver);

      // Update match status based on super over result
      await this.updateMatchAfterSuperOver(
        queryRunner,
        superOver.matchId,
        dto.winningTeamId,
        userId,
      );

      await queryRunner.commitTransaction();

      return {
        superOver: savedSuperOver,
        message: `Super over completed. Team won by ${dto.margin}`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Abandon super over (due to weather, etc.)
   */
  async abandonSuperOver(
    superOverId: string,
    dto: AbandonSuperOverDto,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const superOverRepository = queryRunner.manager.getRepository(SuperOver);
      const matchRepository = queryRunner.manager.getRepository(Match);

      const superOver = await superOverRepository.findOne({
        where: { id: superOverId },
      });
      if (!superOver) {
        throw new NotFoundException('Super over not found');
      }

      if (
        superOver.status !== SuperOverStatus.SCHEDULED &&
        superOver.status !== SuperOverStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          `Cannot abandon super over with status ${superOver.status}`,
        );
      }

      await this.matchPermission.assertCanManage(superOver.matchId, userId);

      // Update super over as abandoned
      superOver.status = SuperOverStatus.ABANDONED;
      superOver.metadata = {
        ...superOver.metadata,
        abandonmentReason: dto.reason,
        abandonmentDetails: dto.details,
        matchSituation: dto.matchSituation,
      };
      superOver.statusChangedAt = new Date();
      superOver.statusChangedBy = userId;

      const savedSuperOver = await superOverRepository.save(superOver);

      // Update match to abandoned or no result based on context
      const match = await matchRepository.findOne({
        where: { id: superOver.matchId },
      });

      if (match) {
        match.status = MatchStatus.NO_RESULT;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        match.abandonmentReason = dto.reason;
        match.abandonmentDetails = dto.details;
        await matchRepository.save(match);
      }

      await queryRunner.commitTransaction();

      return {
        superOver: savedSuperOver,
        message: `Super over abandoned due to ${dto.reason}`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update super over status
   */
  async updateSuperOverStatus(
    superOverId: string,
    dto: SuperOverStatusDto,
    userId: string,
  ): Promise<{ superOver: SuperOver; message: string }> {
    const superOverRepository = this.dataSource.getRepository(SuperOver);

    const superOver = await superOverRepository.findOne({
      where: { id: superOverId },
    });
    if (!superOver) {
      throw new NotFoundException('Super over not found');
    }

    // Validate status transition
    this.validateSuperOverStatusTransition(superOver.status, dto.status);

    await this.matchPermission.assertCanManage(superOver.matchId, userId);

    superOver.status = dto.status;
    superOver.statusChangedAt = new Date();
    superOver.statusChangedBy = userId;
    superOver.metadata = {
      ...superOver.metadata,
      statusChangeReason: dto.reason,
    };

    const savedSuperOver = await superOverRepository.save(superOver);

    return {
      superOver: savedSuperOver,
      message: `Super over status updated to ${dto.status}`,
    };
  }

  /**
   * Get super over by ID
   */
  async getSuperOver(superOverId: string): Promise<SuperOver> {
    const superOverRepository = this.dataSource.getRepository(SuperOver);

    const superOver = await superOverRepository.findOne({
      where: { id: superOverId },
      relations: ['match', 'teamA', 'teamB'],
    });

    if (!superOver) {
      throw new NotFoundException('Super over not found');
    }

    return superOver;
  }

  /**
   * Get all super overs for a match
   */
  async getMatchSuperOvers(matchId: string): Promise<SuperOver[]> {
    const superOverRepository = this.dataSource.getRepository(SuperOver);

    return await superOverRepository.find({
      where: { matchId },
      relations: ['teamA', 'teamB'],
      order: { superOverNumber: 'ASC' },
    });
  }

  /**
   * Determine super over winner based on scores
   */
  private determineSuperOverWinner(superOver: SuperOver): {
    winningTeamId: string;
    margin: string;
    resultMessage: string;
  } {
    const teamAScore = superOver.teamARuns;
    const teamBScore = superOver.teamBRuns;
    const teamAWickets = superOver.teamAWickets;
    const teamBWickets = superOver.teamBWickets;

    if (teamAScore > teamBScore) {
      return {
        winningTeamId: superOver.teamAId,
        margin: `${teamAScore - teamBScore} runs`,
        resultMessage: `Team A won by ${teamAScore - teamBScore} runs (${teamAScore}-${teamAWickets} vs ${teamBScore}-${teamBWickets})`,
      };
    } else if (teamBScore > teamAScore) {
      return {
        winningTeamId: superOver.teamBId,
        margin: `${teamBScore - teamAScore} runs`,
        resultMessage: `Team B won by ${teamBScore - teamAScore} runs (${teamBScore}-${teamBWickets} vs ${teamAScore}-${teamAWickets})`,
      };
    } else {
      // Still tied - this shouldn't happen in normal flow
      throw new BadRequestException(
        'Super over is still tied. Another super over is needed.',
      );
    }
  }

  /**
   * Update match status after super over completion
   */
  private async updateMatchAfterSuperOver(
    queryRunner: any,
    matchId: string,
    winningTeamId: string,
    userId: string,
  ): Promise<void> {
    const matchRepository = queryRunner.manager.getRepository(Match);

    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    match.status = MatchStatus.COMPLETED;
    match.winningTeamId = winningTeamId;
    match.result = 'Match won in super over';
    match.marginType = 'super over';
    match.statusChangedAt = new Date();
    match.statusChangedBy = userId;

    await matchRepository.save(match);
  }

  /**
   * Validate super over status transitions
   */
  private validateSuperOverStatusTransition(
    currentStatus: SuperOverStatus,
    newStatus: SuperOverStatus,
  ): void {
    const validTransitions: Record<SuperOverStatus, SuperOverStatus[]> = {
      [SuperOverStatus.SCHEDULED]: [
        SuperOverStatus.IN_PROGRESS,
        SuperOverStatus.ABANDONED,
      ],
      [SuperOverStatus.IN_PROGRESS]: [
        SuperOverStatus.COMPLETED,
        SuperOverStatus.ABANDONED,
      ],
      [SuperOverStatus.COMPLETED]: [],
      [SuperOverStatus.ABANDONED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`,
      );
    }
  }
}
