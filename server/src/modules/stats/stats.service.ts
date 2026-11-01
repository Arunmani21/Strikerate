import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PlayerMatchPerformance } from './player-match-performance.entity';
import { PlayerCareerStats } from './player-career-stats.entity';
import { TeamMatchHistory } from './team-match-history.entity';
import { Match, MatchStatus } from '../match/match.entity';
import { Innings } from '../innings/innings.entity';
import { Ball } from '../scoring/ball.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { Player } from '../player/player.entity';
import { MatchPermissionService } from '../../common/match-permission.service';

@Injectable()
export class StatsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly matchPermission: MatchPermissionService,
  ) {}

  async calculateMatchPerformance(matchId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchRepository = queryRunner.manager.getRepository(Match);
      const inningsRepository = queryRunner.manager.getRepository(Innings);
      const ballRepository = queryRunner.manager.getRepository(Ball);
      const playing11Repository = queryRunner.manager.getRepository(Playing11);
      const performanceRepository = queryRunner.manager.getRepository(PlayerMatchPerformance);
      const careerStatsRepository = queryRunner.manager.getRepository(PlayerCareerStats);
      const teamHistoryRepository = queryRunner.manager.getRepository(TeamMatchHistory);
      const playerRepository = queryRunner.manager.getRepository(Player);

      // Get match
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status !== MatchStatus.COMPLETED) {
        throw new BadRequestException('Match must be completed before calculating stats');
      }

      await this.matchPermission.assertCanManage(matchId, userId);

      // Get all innings
      const innings = await inningsRepository.find({
        where: { matchId },
        order: { inningsNumber: 'ASC' },
      });

      // Get playing 11 for both teams
      const teamAPlaying11 = await playing11Repository.find({
        where: { matchId, teamId: match.teamAId },
        relations: ['player'],
      });

      const teamBPlaying11 = await playing11Repository.find({
        where: { matchId, teamId: match.teamBId },
        relations: ['player'],
      });

      // Calculate performance for each player
      for (const playing11 of [...teamAPlaying11, ...teamBPlaying11]) {
        const player = playing11.player;

        // Get all balls for this player as batsman
        const battingBalls = await ballRepository.find({
          where: { matchId, batsmanId: player.id },
        });

        // Get all balls for this player as bowler
        const bowlingBalls = await ballRepository.find({
          where: { matchId, bowlerId: player.id },
        });

        // Calculate batting stats
        const runsScored = battingBalls.reduce((sum, ball) => {
          if (ball.isBye || ball.isLegBye) return sum;
          return sum + ball.runs;
        }, 0);

        const ballsFaced = battingBalls.filter(
          (ball) => !ball.isWide && !ball.isNoBall
        ).length;

        const fours = battingBalls.filter(
          (ball) => ball.runs === 4 && !ball.isBye && !ball.isLegBye
        ).length;

        const sixes = battingBalls.filter(
          (ball) => ball.runs === 6 && !ball.isBye && !ball.isLegBye
        ).length;

        const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;

        // Find if out and dismissal type
        const dismissalBall = battingBalls.find(
          (ball) => ball.isWicket && ball.dismissedPlayerId === player.id
        );

        const isOut = !!dismissalBall;
        const wicketType = dismissalBall?.wicketType;

        // Calculate bowling stats
        const legalBallsBowled = bowlingBalls.filter(
          (ball) => !ball.isWide && !ball.isNoBall
        ).length;

        const oversBowled = legalBallsBowled / 6;
        const runsConceded = bowlingBalls.reduce(
          (sum, ball) => sum + ball.runs + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0),
          0
        );

        const wicketsTaken = bowlingBalls.filter(
          (ball) => ball.isWicket && ball.wicketType !== 'runout'
        ).length;

        const economy = oversBowled > 0 ? runsConceded / oversBowled : 0;

        const wides = bowlingBalls.filter((ball) => ball.isWide).length;
        const noBalls = bowlingBalls.filter((ball) => ball.isNoBall).length;

        // Calculate maidens (overs with 0 runs)
        const maidens = await this.calculateMaidens(innings, player.id, queryRunner);

        // Create or update performance record
        let performance = await performanceRepository.findOne({
          where: { playerId: player.id, matchId },
        });

        if (!performance) {
          performance = performanceRepository.create({
            playerId: player.id,
            matchId,
            teamId: player.teamId,
          });
        }

        performance.runsScored = runsScored;
        performance.ballsFaced = ballsFaced;
        performance.fours = fours;
        performance.sixes = sixes;
        performance.strikeRate = strikeRate;
        performance.isOut = isOut;
        performance.wicketType = wicketType;
        performance.oversBowled = oversBowled;
        performance.runsConceded = runsConceded;
        performance.wicketsTaken = wicketsTaken;
        performance.economy = economy;
        performance.maidens = maidens;
        performance.wides = wides;
        performance.noBalls = noBalls;

        await performanceRepository.save(performance);
      }

      // Recompute career stats from all performance rows (idempotent — safe to re-run)
      for (const playing11 of [...teamAPlaying11, ...teamBPlaying11]) {
        await this.recalculateCareerStats(playing11.player.id, queryRunner);
      }

      // Create team match history
      await this.createTeamMatchHistory(match, innings, queryRunner);

      await queryRunner.commitTransaction();

      return { message: 'Statistics calculated successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateMaidens(
    innings: Innings[],
    bowlerId: string,
    queryRunner: any
  ): Promise<number> {
    let maidens = 0;

    for (const singleInnings of innings) {
      const balls = await queryRunner.manager.getRepository(Ball).find({
        where: { inningsId: singleInnings.id, bowlerId },
        order: { overNumber: 'ASC', ballNumber: 'ASC' },
      });

      const oversMap = new Map<number, number[]>();

      for (const ball of balls) {
        if (!ball.isWide && !ball.isNoBall) {
          if (!oversMap.has(ball.overNumber)) {
            oversMap.set(ball.overNumber, []);
          }
          const totalRuns = ball.runs + (ball.isBye || ball.isLegBye ? ball.extraRuns || 0 : 0);
          oversMap.get(ball.overNumber)!.push(totalRuns);
        }
      }

      for (const [, runs] of oversMap) {
        const overTotal = runs.reduce((sum, r) => sum + r, 0);
        if (overTotal === 0) {
          maidens++;
        }
      }
    }

    return maidens;
  }

  /**
   * Recompute career stats from the player's full performance set.
   * Idempotent — calculate can safely be re-run for the same match.
   */
  private async recalculateCareerStats(playerId: string, queryRunner: any) {
    const careerStatsRepository = queryRunner.manager.getRepository(PlayerCareerStats);
    const performanceRepository = queryRunner.manager.getRepository(PlayerMatchPerformance);
    const playerRepository = queryRunner.manager.getRepository(Player);

    const player = await playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const performances = await performanceRepository.find({ where: { playerId } });

    let careerStats = await careerStatsRepository.findOne({
      where: { playerId },
    });

    if (!careerStats) {
      careerStats = careerStatsRepository.create({
        playerId,
        userId: player.userId || '', // Default to empty string if userId is null
      });
    }

    const batted = performances.filter((p) => p.ballsFaced > 0);
    const totalRuns = performances.reduce((sum, p) => sum + p.runsScored, 0);
    const totalBallsFaced = batted.reduce((sum, p) => sum + p.ballsFaced, 0);
    const totalNotOuts = batted.filter((p) => !p.isOut).length;

    careerStats.totalMatches = performances.length;
    careerStats.totalInnings = batted.length;
    careerStats.totalRuns = totalRuns;
    careerStats.highestScore = performances.reduce((max, p) => Math.max(max, p.runsScored), 0);
    careerStats.totalFours = performances.reduce((sum, p) => sum + p.fours, 0);
    careerStats.totalSixes = performances.reduce((sum, p) => sum + p.sixes, 0);
    careerStats.totalFifties = performances.filter(
      (p) => p.runsScored >= 50 && p.runsScored < 100
    ).length;
    careerStats.totalHundreds = performances.filter((p) => p.runsScored >= 100).length;
    careerStats.totalNotOuts = totalNotOuts;
    careerStats.totalDucks = performances.filter((p) => p.runsScored === 0 && p.isOut).length;

    const dismissals = careerStats.totalInnings - careerStats.totalNotOuts;
    careerStats.careerBattingAvg = dismissals > 0 ? totalRuns / dismissals : 0;
    careerStats.careerStrikeRate = totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;

    careerStats.totalWickets = performances.reduce((sum, p) => sum + p.wicketsTaken, 0);
    careerStats.totalOversBowled = performances.reduce(
      (sum, p) => sum + Number(p.oversBowled),
      0
    );
    careerStats.totalRunsConceded = performances.reduce((sum, p) => sum + p.runsConceded, 0);
    careerStats.totalMaidens = performances.reduce((sum, p) => sum + p.maidens, 0);

    const bowlingFigures = performances.filter((p) => p.wicketsTaken > 0);
    if (bowlingFigures.length > 0) {
      const best = bowlingFigures.reduce((best, p) =>
        p.wicketsTaken > best.wicketsTaken ||
        (p.wicketsTaken === best.wicketsTaken && p.runsConceded < best.runsConceded)
          ? p
          : best
      );
      careerStats.bestBowling = `${best.wicketsTaken}/${best.runsConceded}`;
    } else {
      careerStats.bestBowling = null;
    }
    careerStats.fiveWicketHauls = performances.filter((p) => p.wicketsTaken >= 5).length;

    careerStats.careerEconomy =
      Number(careerStats.totalOversBowled) > 0
        ? careerStats.totalRunsConceded / Number(careerStats.totalOversBowled)
        : 0;

    careerStats.updatedAt = new Date();
    await careerStatsRepository.save(careerStats);
  }

  private async createTeamMatchHistory(
    match: Match,
    innings: Innings[],
    queryRunner: any
  ) {
    const teamHistoryRepository = queryRunner.manager.getRepository(TeamMatchHistory);

    // Team A history
    const teamAInnings = innings.find((inn) => inn.battingTeamId === match.teamAId);
    const teamBInnings = innings.find((inn) => inn.battingTeamId === match.teamBId);

    // Classify from the structured winner column — result strings are free-form
    // (manual completions, super-over wins) and cannot be string-matched.
    let teamAResult: string;
    let teamBResult: string;

    if (match.winningTeamId === match.teamAId) {
      teamAResult = 'won';
      teamBResult = 'lost';
    } else if (match.winningTeamId === match.teamBId) {
      teamAResult = 'lost';
      teamBResult = 'won';
    } else if (match.result?.toLowerCase().includes('tied')) {
      teamAResult = 'tied';
      teamBResult = 'tied';
    } else {
      teamAResult = 'abandoned';
      teamBResult = 'abandoned';
    }

    const upsertHistory = async (
      teamId: string,
      opponentId: string,
      result: string,
      own: Innings | undefined,
      opp: Innings | undefined
    ) => {
      let row = await teamHistoryRepository.findOne({
        where: { teamId, matchId: match.id },
      });
      if (!row) {
        row = teamHistoryRepository.create({ teamId, matchId: match.id, opponentId });
      }
      row.result = result;
      row.matchDate = match.matchDate;
      row.runsScored = own?.totalRuns || 0;
      row.wicketsLost = own?.totalWickets || 0;
      row.oversPlayed = own ? own.totalBalls / 6 : 0;
      row.runsConceded = opp?.totalRuns || 0;
      row.wicketsTaken = opp?.totalWickets || 0;
      await teamHistoryRepository.save(row);
    };

    await upsertHistory(match.teamAId, match.teamBId, teamAResult, teamAInnings, teamBInnings);
    await upsertHistory(match.teamBId, match.teamAId, teamBResult, teamBInnings, teamAInnings);
  }

  async getPlayerCareerStats(playerId: string) {
    const careerStatsRepository = this.dataSource.getRepository(PlayerCareerStats);

    const stats = await careerStatsRepository.findOne({
      where: { playerId },
    });

    if (!stats) {
      throw new NotFoundException('Career stats not found for this player');
    }

    return stats;
  }

  async getPlayerMatchHistory(playerId: string) {
    const performanceRepository = this.dataSource.getRepository(PlayerMatchPerformance);

    const performances = await performanceRepository.find({
      where: { playerId },
      relations: ['match'],
      order: { createdAt: 'DESC' },
    });

    return performances;
  }

  async getMatchPerformances(matchId: string) {
    const performanceRepository = this.dataSource.getRepository(PlayerMatchPerformance);

    const performances = await performanceRepository.find({
      where: { matchId },
      relations: ['player', 'team'],
    });

    return performances;
  }

  async getTeamHistory(teamId: string) {
    const teamHistoryRepository = this.dataSource.getRepository(TeamMatchHistory);

    const history = await teamHistoryRepository.find({
      where: { teamId },
      relations: ['match', 'opponent'],
      order: { matchDate: 'DESC' },
    });

    return history;
  }

  async setPlayerOfMatch(matchId: string, playerId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const performanceRepository = queryRunner.manager.getRepository(PlayerMatchPerformance);

      await this.matchPermission.assertCanManage(matchId, userId);

      // Remove player of match from all players in this match
      await performanceRepository.update(
        { matchId },
        { isPlayerOfMatch: false }
      );

      // Set new player of match
      const result = await performanceRepository.update(
        { matchId, playerId },
        { isPlayerOfMatch: true }
      );

      if (result.affected === 0) {
        throw new NotFoundException('Performance not found for this player in this match');
      }

      await queryRunner.commitTransaction();

      return { message: 'Player of match updated successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}