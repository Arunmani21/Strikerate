import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { Innings } from '../innings/innings.entity';
import { RetireHurtDto, ReturnFromRetirementDto, SubstituteFielderDto } from './dto/retire-hurt.dto';
import { ScorerTransferService } from './scorer-transfer.service';

@Injectable()
export class RetireHurtService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private scorerTransferService: ScorerTransferService,
  ) {}

  /**
   * Handle batsman retiring hurt
   * Updates player performance and marks them as retired hurt
   */
  async retireHurt(
    inningsId: string,
    userId: string,
    dto: RetireHurtDto,
  ): Promise<{ performance: PlayerMatchPerformance; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const performanceRepository = queryRunner.manager.getRepository(PlayerMatchPerformance);
      const inningsRepository = queryRunner.manager.getRepository(Innings);

      // Get innings to validate
      const innings = await inningsRepository.findOne({ where: { id: inningsId } });
      if (!innings) {
        throw new NotFoundException('Innings not found');
      }

      const canScore = await this.scorerTransferService.canUserScore(innings.matchId, userId);
      if (!canScore) {
        throw new ForbiddenException('You do not have permission to score this match');
      }

      // Get player performance for this innings
      let performance = await performanceRepository.findOne({
        where: {
          playerId: dto.playerId,
          matchId: innings.matchId,
          teamId: innings.battingTeamId,
        },
      });

      if (!performance) {
        // Create performance record if it doesn't exist
        performance = performanceRepository.create({
          playerId: dto.playerId,
          matchId: innings.matchId,
          teamId: innings.battingTeamId,
          runsScored: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
        });
      }

      // Check if player is already out
      if (performance.isOut) {
        throw new BadRequestException('Player is already out and cannot retire hurt');
      }

      // Check if player is already retired hurt
      if (performance.isRetiredHurt) {
        throw new BadRequestException('Player is already retired hurt');
      }

      // Update performance with retire hurt status
      performance.isRetiredHurt = true;
      performance.retiredHurtAt = new Date();
      // Legal balls bowled so far, taken from the innings itself (lossless)
      performance.retiredHurtBallNumber = innings.totalBalls;

      // Store retirement reason and notes in metadata if available
      if (!performance.matchRating) {
        performance.matchRating = 0 as any; // Initialize matchRating if needed
      }

      const savedPerformance = await performanceRepository.save(performance);

      await queryRunner.commitTransaction();

      return {
        performance: savedPerformance,
        message: `${dto.reason.charAt(0).toUpperCase() + dto.reason.slice(1)} - Player retired hurt`,
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
   * Handle batsman returning from retirement
   * Allows them to resume their innings
   */
  async returnFromRetirement(
    inningsId: string,
    userId: string,
    dto: ReturnFromRetirementDto,
  ): Promise<{ performance: PlayerMatchPerformance; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const performanceRepository = queryRunner.manager.getRepository(PlayerMatchPerformance);
      const inningsRepository = queryRunner.manager.getRepository(Innings);

      // Get innings to validate
      const innings = await inningsRepository.findOne({ where: { id: inningsId } });
      if (!innings) {
        throw new NotFoundException('Innings not found');
      }

      const canScore = await this.scorerTransferService.canUserScore(innings.matchId, userId);
      if (!canScore) {
        throw new ForbiddenException('You do not have permission to score this match');
      }

      // Get player performance
      const performance = await performanceRepository.findOne({
        where: {
          playerId: dto.playerId,
          matchId: innings.matchId,
          teamId: innings.battingTeamId,
        },
      });

      if (!performance) {
        throw new NotFoundException('Player performance not found');
      }

      // Check if player is actually retired hurt
      if (!performance.isRetiredHurt) {
        throw new BadRequestException('Player is not retired hurt');
      }

      // Check if player has already returned
      if (performance.returnedFromRetirement) {
        throw new BadRequestException('Player has already returned from retirement');
      }

      // Check if player is out (in case they got out while retired)
      if (performance.isOut) {
        throw new BadRequestException('Player cannot return as they are already out');
      }

      // Update performance with return status
      performance.returnedFromRetirement = true;
      // Legal balls bowled so far, taken from the innings itself (lossless)
      performance.returnedAtBall = innings.totalBalls;

      const savedPerformance = await performanceRepository.save(performance);

      await queryRunner.commitTransaction();

      return {
        performance: savedPerformance,
        message: 'Player has returned from retirement and can continue batting',
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
   * Get current status of retired hurt players in an innings
   */
  async getRetiredHurtPlayers(inningsId: string): Promise<PlayerMatchPerformance[]> {
    const performanceRepository = this.dataSource.getRepository(PlayerMatchPerformance);
    const inningsRepository = this.dataSource.getRepository(Innings);

    // Get innings to get match info
    const innings = await inningsRepository.findOne({ where: { id: inningsId } });
    if (!innings) {
      throw new NotFoundException('Innings not found');
    }

    // Get all retired hurt players for this innings who haven't returned yet
    const retiredPlayers = await performanceRepository.find({
      where: {
        matchId: innings.matchId,
        teamId: innings.battingTeamId,
        isRetiredHurt: true,
        returnedFromRetirement: false,
        isOut: false,
      },
    });

    return retiredPlayers;
  }

  /**
   * Handle substitute fielder scenario
   * When a fielder gets injured and needs to be replaced temporarily
   */
  async handleSubstituteFielder(
    matchId: string,
    dto: SubstituteFielderDto,
  ): Promise<{ message: string; substitution: any }> {
    // Persisting substitutions needs a dedicated table; refuse instead of
    // pretending to record anything, so no UI builds on fake state.
    throw new NotImplementedException('Substitute fielder tracking is not implemented');
  }

  /**
   * Check if a player can return from retirement
   */
  async canPlayerReturn(inningsId: string, playerId: string): Promise<boolean> {
    const performanceRepository = this.dataSource.getRepository(PlayerMatchPerformance);
    const inningsRepository = this.dataSource.getRepository(Innings);

    // Get innings
    const innings = await inningsRepository.findOne({ where: { id: inningsId } });
    if (!innings) {
      return false;
    }

    // Get player performance
    const performance = await performanceRepository.findOne({
      where: {
        playerId,
        matchId: innings.matchId,
        teamId: innings.battingTeamId,
        isRetiredHurt: true,
        returnedFromRetirement: false,
        isOut: false,
      },
    });

    return !!performance;
  }

  /**
   * Get retirement statistics for a match
   */
  async getRetirementStats(matchId: string): Promise<{
    totalRetirements: number;
    returnedPlayers: number;
    currentlyRetired: PlayerMatchPerformance[];
  }> {
    const performanceRepository = this.dataSource.getRepository(PlayerMatchPerformance);

    const retiredPlayers = await performanceRepository.find({
      where: { matchId, isRetiredHurt: true },
    });

    const returnedPlayers = retiredPlayers.filter(p => p.returnedFromRetirement).length;
    const currentlyRetired = retiredPlayers.filter(
      p => !p.returnedFromRetirement && !p.isOut
    );

    return {
      totalRetirements: retiredPlayers.length,
      returnedPlayers,
      currentlyRetired,
    };
  }
}
