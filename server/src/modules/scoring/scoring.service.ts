import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { Ball, DismissalType } from './ball.entity';
import { Innings } from '../innings/innings.entity';
import { Match, MatchStatus } from '../match/match.entity';
import { Player } from '../player/player.entity';
import { Team } from '../team/team.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { BallInputDto } from './dto/ball-input.dto';
import { CricketGateway } from '../../gateway/cricket.gateway';
import { ScorerTransferService } from './scorer-transfer.service';

export interface BallResult {
  ball: Ball;
  innings: Innings;
  matchCompleted?: boolean;
  inningsCompleted?: boolean;
  overCompleted?: boolean;
  wicket?: {
    type: DismissalType;
    batsman: string;
    bowler: string;
  };
}

@Injectable()
export class ScoringService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private cricketGateway: CricketGateway,
    private scorerTransferService: ScorerTransferService,
  ) { }

  async deliverBall(userId: string, dto: BallInputDto): Promise<BallResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ballRepository = queryRunner.manager.getRepository(Ball);
      const inningsRepository = queryRunner.manager.getRepository(Innings);
      const matchRepository = queryRunner.manager.getRepository(Match);
      const playerRepository = queryRunner.manager.getRepository(Player);
      const teamRepository = queryRunner.manager.getRepository(Team);

      // STEP 1: VALIDATION
      // Get innings
      const innings = await inningsRepository.findOne({
        where: { id: dto.inningsId },
      });

      if (!innings) {
        throw new NotFoundException('Innings not found');
      }

      if (innings.isCompleted) {
        throw new BadRequestException('Innings is completed');
      }

      // Get match
      const match = await matchRepository.findOne({
        where: { id: innings.matchId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Scheduled/toss-done matches go live automatically when the first ball is recorded
      const scheduledStatuses = [MatchStatus.SCHEDULED, MatchStatus.TOSS_DONE];
      if (match.status !== MatchStatus.LIVE && !scheduledStatuses.includes(match.status)) {
        throw new BadRequestException('Match is not live');
      }

      const canScore = await this.scorerTransferService.canUserScore(match.id, userId);
      if (!canScore) {
        throw new ForbiddenException('You do not have permission to score this match');
      }

      // Validate batsman and bowler
      const batsman = await playerRepository.findOne({
        where: { id: dto.batsmanId },
      });

      const bowler = await playerRepository.findOne({
        where: { id: dto.bowlerId },
      });

      if (!batsman || !bowler) {
        throw new NotFoundException('Batsman or bowler not found');
      }

      if (batsman.teamId !== innings.battingTeamId) {
        throw new BadRequestException('Batsman must be from batting team');
      }

      if (bowler.teamId !== innings.bowlingTeamId) {
        throw new BadRequestException('Bowler must be from bowling team');
      }

      // Validate dismissal data
      if (dto.isWicket && !dto.wicketType) {
        throw new BadRequestException('Wicket type is required when isWicket is true');
      }

      if (dto.wicketType === DismissalType.RUNOUT && !dto.dismissedPlayerId) {
        throw new BadRequestException('Dismissed player ID is required for run out');
      }

      // STEP 2: LEGAL BALL CALCULATION
      const isExtra = dto.isWide || dto.isNoBall;
      const isBye = dto.isBye || dto.isLegBye;
      const legalBallCount = isExtra ? 0 : 1;
      // Balls faced exclude only wides; no-balls and byes count as balls faced
      const countsAsBallFaced = !dto.isWide;

      // STEP 3: RUN CALCULATION (standard cricket attribution)
      // Batsman never scores off byes/leg-byes or wides; off-bat no-ball runs count.
      const batsmanRuns = isBye || dto.isWide ? 0 : dto.runs;
      const totalRuns = dto.runs + (dto.extraRuns || 0) + (dto.isWide ? 1 : 0) + (dto.isNoBall ? 1 : 0);
      // Bowler is charged everything off a wide, the no-ball penalty plus any penalty
      // extra runs, and never byes/leg-byes or plain off-bat runs off a no-ball.
      const bowlerRuns = dto.isWide
        ? totalRuns
        : dto.isNoBall
          ? 1 + (dto.extraRuns || 0)
          : isBye
            ? 0
            : dto.runs;

      // STEP 4: BATSMAN STATS UPDATE
      batsman.battingRuns += batsmanRuns;
      if (countsAsBallFaced) {
        batsman.battingBalls += 1;
      }
      if (batsmanRuns === 4) batsman.battingFours++;
      if (batsmanRuns === 6) batsman.battingSixes++;

      // Update strike rate
      if (batsman.battingBalls > 0) {
        batsman.battingStrikeRate = (batsman.battingRuns / batsman.battingBalls) * 100;
      }

      // STEP 5: BOWLER STATS UPDATE
      bowler.bowlingRuns += bowlerRuns;
      bowler.bowlingBalls += legalBallCount;

      // Update economy
      if (bowler.bowlingBalls > 0) {
        bowler.bowlingEconomy = bowler.bowlingRuns / (bowler.bowlingBalls / 6);
      }

      // STEP 6: WICKET HANDLING
      let dismissedPlayer: Player | null = null;
      if (dto.isWicket) {
        if (dto.wicketType === DismissalType.RUNOUT) {
          dismissedPlayer = await playerRepository.findOne({
            where: { id: dto.dismissedPlayerId! },
          });
          if (!dismissedPlayer) {
            throw new NotFoundException('Dismissed player not found');
          }
          dismissedPlayer.isOut = true;
        } else {
          batsman.isOut = true;
          dismissedPlayer = batsman;
        }

        // Run outs are not credited to the bowler
        if (dto.wicketType !== DismissalType.RUNOUT) {
          bowler.bowlingWickets++;
        }
        innings.totalWickets++;
      }

      // STEP 7: STRIKE ROTATION
      // Batsmen swap ends whenever they run an odd number, wides and no-balls included
      const shouldSwapStrike = dto.runs % 2 === 1;

      // STEP 8: OVER MANAGEMENT
      const currentBallsInOver = innings.totalBalls % 6;
      // Capture before any mutation — the ball belongs to the over being bowled
      const overOfThisBall = innings.currentOver;
      const isOverComplete = currentBallsInOver === 5 && !isExtra;

      if (isOverComplete) {
        innings.currentOver++;
      }
      // An odd run off the last ball of an over swaps ends twice (for the run and for
      // the over change), cancelling out — the two swaps must apply independently.
      if (shouldSwapStrike) {
        const temp = innings.strikerId;
        innings.strikerId = innings.nonStrikerId;
        innings.nonStrikerId = temp;
      }
      if (isOverComplete) {
        const temp = innings.strikerId;
        innings.strikerId = innings.nonStrikerId;
        innings.nonStrikerId = temp;
      }

      // STEP 9: RUN RATE CALCULATION
      innings.totalBalls += legalBallCount;
      innings.totalRuns += totalRuns;

      // STEP 10: WIN CONDITION CHECK
      let matchCompleted = false;
      let inningsCompleted = false;
      let matchStarted = false;

      // Check if innings is complete (all wickets down or overs complete)
      const maxOvers = match.totalOvers;
      const totalBallsBowled = innings.totalBalls;
      const totalOversBowled = Math.floor(totalBallsBowled / 6);

      // AUTOMATIC STATUS UPDATE: Match goes LIVE when first ball is bowled
      if (scheduledStatuses.includes(match.status)) {
        if (totalBallsBowled > 0) {
          match.status = MatchStatus.LIVE;
          match.statusChangedAt = new Date();
          match.statusChangedBy = userId;
          matchStarted = true;
        }
      }

      // The batting side is all out at (playing XI size - 1) wickets
      const maxWickets = await this.getMaxWickets(queryRunner, match.id, innings.battingTeamId);

      if (innings.totalWickets >= maxWickets || totalOversBowled >= maxOvers) {
        innings.isCompleted = true;
        inningsCompleted = true;

        // Check if match is complete or if second innings needed
        if (match.currentInnings === 2) {
          // Second innings complete - determine winner
          matchCompleted = true;
          match.statusChangedAt = new Date();
          match.statusChangedBy = userId;

          const targetRuns = match.target + 1;
          if (innings.totalRuns >= targetRuns) {
            const battingTeam = await teamRepository.findOne({
              where: { id: innings.battingTeamId },
            });
            match.status = MatchStatus.COMPLETED;
            match.winningTeamId = innings.battingTeamId;
            match.marginOfVictory = `${maxWickets - innings.totalWickets} wickets`;
            match.marginType = 'wickets';
            match.result = `${battingTeam?.name || 'Batting team'} won by ${maxWickets - innings.totalWickets} wickets`;
          } else if (innings.totalRuns < match.target) {
            const otherTeamId = match.teamAId === innings.battingTeamId ? match.teamBId : match.teamAId;
            const bowlingTeam = await teamRepository.findOne({
              where: { id: otherTeamId },
            });
            match.status = MatchStatus.COMPLETED;
            match.winningTeamId = otherTeamId;
            match.marginOfVictory = `${match.target - innings.totalRuns} runs`;
            match.marginType = 'runs';
            match.result = `${bowlingTeam?.name || 'Bowling team'} won by ${match.target - innings.totalRuns} runs`;
          } else {
            // AUTOMATIC DETECTION: Match tied
            match.status = MatchStatus.TIED;
            match.result = 'Match tied - Scores are level';
          }
        } else {
          // First innings complete - set target and start second innings
          match.status = MatchStatus.INNINGS_BREAK;
          match.statusChangedAt = new Date();
          match.statusChangedBy = userId;
          match.target = innings.totalRuns;
          match.currentInnings = 2;
        }
      }

      // STEP 11: SAVE BALL RECORD
      const ball = ballRepository.create({
        overNumber: overOfThisBall,
        ballNumber: currentBallsInOver + 1,
        runs: dto.runs,
        extraRuns: dto.extraRuns || 0,
        isWide: dto.isWide || false,
        isNoBall: dto.isNoBall || false,
        isBye: dto.isBye || false,
        isLegBye: dto.isLegBye || false,
        isWicket: dto.isWicket || false,
        wicketType: dto.wicketType,
        inningsId: dto.inningsId,
        matchId: match.id,
        batsmanId: dto.batsmanId,
        bowlerId: dto.bowlerId,
        dismissedPlayerId: dto.dismissedPlayerId,
        commentary: dto.commentary,
      });

      const savedBall = await ballRepository.save(ball);

      // STEP 12: SAVE ALL ENTITIES
      await playerRepository.save(batsman);
      await playerRepository.save(bowler);
      if (dismissedPlayer && dismissedPlayer.id !== batsman.id) {
        await playerRepository.save(dismissedPlayer);
      }
      await inningsRepository.save(innings);
      await matchRepository.save(match);

      await queryRunner.commitTransaction();

      // STEP 13: EMIT SOCKET EVENTS
      // Re-read both batters so the payload matches the post-rotation state
      const readPlayerRepository = this.dataSource.getRepository(Player);
      const [strikerRow, nonStrikerRow] = await Promise.all([
        innings.strikerId
          ? readPlayerRepository.findOne({ where: { id: innings.strikerId } })
          : Promise.resolve(null),
        innings.nonStrikerId
          ? readPlayerRepository.findOne({ where: { id: innings.nonStrikerId } })
          : Promise.resolve(null),
      ]);

      // Calculate current run rate
      const currentRunRate = innings.totalBalls > 0
        ? (innings.totalRuns / innings.totalBalls) * 6
        : 0;

      // Calculate required run rate (2nd innings only)
      let requiredRunRate = 0;
      if (match.currentInnings === 2 && match.target > 0) {
        const remainingBalls = (match.totalOvers * 6) - innings.totalBalls;
        const remainingRuns = match.target - innings.totalRuns + 1;
        requiredRunRate = remainingBalls > 0
          ? (remainingRuns / remainingBalls) * 6
          : 99.99;
      }

      const completedOvers = Math.floor(innings.totalBalls / 6);

      if (matchStarted) {
        const startingTeams = await this.dataSource.getRepository(Team).find({
          where: [{ id: match.teamAId }, { id: match.teamBId }],
        });
        this.cricketGateway.emitMatchStarted(match.id, {
          matchId: match.id,
          teamA: {
            id: match.teamAId,
            name: startingTeams.find(t => t.id === match.teamAId)?.name || '',
          },
          teamB: {
            id: match.teamBId,
            name: startingTeams.find(t => t.id === match.teamBId)?.name || '',
          },
          totalOvers: match.totalOvers,
          venue: match.venue || '',
        });
      }

      // Emit ball-updated event
      this.cricketGateway.emitBallUpdated(match.id, {
        overNumber: overOfThisBall,
        ballNumber: currentBallsInOver + 1,
        totalRuns: innings.totalRuns,
        totalWickets: innings.totalWickets,
        currentOvers: completedOvers,
        currentRunRate: parseFloat(currentRunRate.toFixed(2)),
        requiredRunRate: match.currentInnings === 2 ? parseFloat(requiredRunRate.toFixed(2)) : undefined,
        target: match.currentInnings === 2 ? match.target : undefined,
        striker: this.batterBlock(strikerRow),
        nonStriker: this.batterBlock(nonStrikerRow),
        bowler: {
          id: bowler.id,
          name: bowler.name,
          overs: this.oversFromBalls(bowler.bowlingBalls),
          runs: bowler.bowlingRuns,
          wickets: bowler.bowlingWickets,
          economy: this.roundRate(bowler.bowlingEconomy),
        },
        extras: (dto.extraRuns || 0) + (dto.isWide ? 1 : 0) + (dto.isNoBall ? 1 : 0),
        lastBall: this.generateLastBallSummary(dto),
      });

      // Emit wicket-fell event
      if (dto.isWicket && dismissedPlayer) {
        this.cricketGateway.emitWicket(match.id, {
          dismissedPlayer: {
            id: dismissedPlayer.id,
            name: dismissedPlayer.name,
            runs: dismissedPlayer.battingRuns,
            balls: dismissedPlayer.battingBalls,
            fours: dismissedPlayer.battingFours,
            sixes: dismissedPlayer.battingSixes,
          },
          wicketType: dto.wicketType!,
          wicketNumber: innings.totalWickets,
          totalWickets: innings.totalWickets,
          totalRuns: innings.totalRuns,
          currentOvers: completedOvers,
        });
      }

      // Emit over-complete event
      if (isOverComplete) {
        const overBalls = await ballRepository.find({
          where: {
            inningsId: dto.inningsId,
            overNumber: overOfThisBall,
          },
        });

        const overRuns = overBalls.reduce(
          (sum, ball) => sum + ball.runs + ball.extraRuns + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0),
          0,
        );

        this.cricketGateway.emitOverComplete(match.id, {
          overNumber: overOfThisBall,
          overRuns,
          totalRuns: innings.totalRuns,
          totalWickets: innings.totalWickets,
          currentOvers: completedOvers,
          currentRunRate: parseFloat(currentRunRate.toFixed(2)),
          requiredRunRate: match.currentInnings === 2 ? parseFloat(requiredRunRate.toFixed(2)) : undefined,
          target: match.currentInnings === 2 ? match.target : undefined,
          bowlerSummary: {
            bowlerName: bowler.name,
            overs: this.oversFromBalls(bowler.bowlingBalls),
            runs: bowler.bowlingRuns,
            wickets: bowler.bowlingWickets,
            maidens: 0, // Calculate maidens if needed
            economy: this.roundRate(bowler.bowlingEconomy),
          },
        });
      }

      // Emit innings-end event
      if (inningsCompleted) {
        const inningsEndTeams = await this.dataSource.getRepository(Team).find({
          where: [{ id: innings.battingTeamId }, { id: innings.bowlingTeamId }],
        });

        this.cricketGateway.emitInningsEnd(match.id, {
          inningsNumber: innings.inningsNumber,
          totalRuns: innings.totalRuns,
          totalWickets: innings.totalWickets,
          totalOvers: completedOvers,
          target: innings.inningsNumber === 1 ? innings.totalRuns + 1 : undefined,
          battingTeam: {
            id: innings.battingTeamId,
            name: inningsEndTeams.find(t => t.id === innings.battingTeamId)?.name || '',
          },
          bowlingTeam: {
            id: innings.bowlingTeamId,
            name: inningsEndTeams.find(t => t.id === innings.bowlingTeamId)?.name || '',
          },
        });
      }

      // Emit match-result event
      if (matchCompleted) {
        const [allInnings, resultTeams] = await Promise.all([
          this.dataSource.getRepository(Innings).find({
            where: { matchId: match.id },
            order: { inningsNumber: 'ASC' },
          }),
          this.dataSource.getRepository(Team).find({
            where: [{ id: match.teamAId }, { id: match.teamBId }],
          }),
        ]);

        const resultTeamName = (teamId: string) =>
          resultTeams.find(t => t.id === teamId)?.name || '';
        const scoreFor = (battingTeamId: string) => {
          const inn = allInnings.find(i => i.battingTeamId === battingTeamId);
          return {
            teamName: resultTeamName(battingTeamId),
            runs: inn?.totalRuns ?? 0,
            wickets: inn?.totalWickets ?? 0,
            overs: Math.floor((inn?.totalBalls ?? 0) / 6),
          };
        };

        this.cricketGateway.emitMatchResult(match.id, {
          result: match.result,
          winningTeam: match.winningTeamId
            ? { id: match.winningTeamId, name: resultTeamName(match.winningTeamId) }
            : undefined,
          margin: match.marginOfVictory || undefined,
          teamAScore: scoreFor(match.teamAId),
          teamBScore: scoreFor(match.teamBId),
        });
      }

      return {
        ball: savedBall,
        innings: await inningsRepository.findOne({ where: { id: dto.inningsId } }),
        matchCompleted,
        inningsCompleted,
        overCompleted: isOverComplete,
        wicket: dto.isWicket ? {
          type: dto.wicketType!,
          batsman: dismissedPlayer?.name || batsman.name,
          bowler: bowler.name,
        } : undefined,
      };
    } catch (error) {
      // The transaction may already be committed (errors in the post-commit
      // socket/response section) or aborted — rolling back an inactive
      // transaction would mask the original error.
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate a human-readable summary of the last ball
   */
  private generateLastBallSummary(dto: BallInputDto): string {
    if (dto.isWicket) return `WICKET! ${dto.wicketType}`;
    if (dto.isWide) return dto.runs > 0 ? `Wide + ${dto.runs}` : 'Wide';
    if (dto.isNoBall) return dto.runs > 0 ? `No ball - ${dto.runs} run(s)` : 'No ball';
    if (dto.runs === 6) return 'SIX!';
    if (dto.runs === 4) return 'FOUR!';
    if (dto.runs === 0) return 'Dot ball';
    return `${dto.runs} run(s)`;
  }

  /** Cricket overs notation: 9 legal balls → "1.3" */
  private oversFromBalls(balls: number): string {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  /** Postgres decimal columns arrive as strings through TypeORM (e.g.
   *  batting_strike_rate reads back "0.00"), so rate fields must be coerced
   *  before formatting — .toFixed() on the raw value throws. */
  private roundRate(value: number | string | null | undefined): number {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
  }

  private batterBlock(player: Player | null) {
    if (!player) {
      return { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 };
    }
    return {
      id: player.id,
      name: player.name,
      runs: player.battingRuns,
      balls: player.battingBalls,
      fours: player.battingFours,
      sixes: player.battingSixes,
      strikeRate: this.roundRate(player.battingStrikeRate),
    };
  }

  /** A batting side is all out one wicket short of its playing XI size */
  private async getMaxWickets(
    queryRunner: QueryRunner,
    matchId: string,
    battingTeamId: string,
  ): Promise<number> {
    const xiSize = await queryRunner.manager
      .getRepository(Playing11)
      .count({ where: { matchId, teamId: battingTeamId } });
    return xiSize > 0 ? xiSize - 1 : 10;
  }

  async getScorecard(matchId: string) {
    const matchRepository = this.dataSource.getRepository(Match);
    const inningsRepository = this.dataSource.getRepository(Innings);
    const ballRepository = this.dataSource.getRepository(Ball);

    const match = await matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const innings = await inningsRepository.find({
      where: { matchId },
      order: { inningsNumber: 'ASC' },
    });

    const scorecard = {
      match,
      innings: [],
    };

    for (const inn of innings) {
      const balls = await ballRepository.find({
        where: { inningsId: inn.id },
        order: { overNumber: 'ASC', ballNumber: 'ASC', createdAt: 'ASC' },
      });

      scorecard.innings.push({
        ...inn,
        balls,
      });
    }

    return scorecard;
  }

  async getOverSummary(inningsId: string) {
    const ballRepository = this.dataSource.getRepository(Ball);

    const balls = await ballRepository.find({
      where: { inningsId },
      order: { overNumber: 'ASC', ballNumber: 'ASC', createdAt: 'ASC' },
    });

    const overSummary = {};

    balls.forEach((ball) => {
      if (!overSummary[ball.overNumber]) {
        overSummary[ball.overNumber] = {
          overNumber: ball.overNumber,
          balls: [],
          totalRuns: 0,
          wickets: 0,
        };
      }

      overSummary[ball.overNumber].balls.push({
        ballNumber: ball.ballNumber,
        runs: ball.runs,
        extraRuns: ball.extraRuns,
        isWide: ball.isWide,
        isNoBall: ball.isNoBall,
        isBye: ball.isBye,
        isLegBye: ball.isLegBye,
        isWicket: ball.isWicket,
      });

      // Same formula used when the ball was delivered
      overSummary[ball.overNumber].totalRuns +=
        ball.runs + ball.extraRuns + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0);
      if (ball.isWicket) overSummary[ball.overNumber].wickets++;
    });

    return Object.values(overSummary);
  }
}
