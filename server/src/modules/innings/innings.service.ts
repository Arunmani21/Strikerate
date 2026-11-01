import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Innings } from './innings.entity';
import { Match, MatchStatus } from '../match/match.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { Player } from '../player/player.entity';
import { StartInningsDto } from './dto/start-innings.dto';
import { SetBatsmenDto } from './dto/set-batsmen.dto';
import { SetBowlerDto } from './dto/set-bowler.dto';

@Injectable()
export class InningsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async startInnings(matchId: string, userId: string, dto: StartInningsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inningsRepository = queryRunner.manager.getRepository(Innings);
      const matchRepository = queryRunner.manager.getRepository(Match);
      const playing11Repository = queryRunner.manager.getRepository(Playing11);

      // Get match
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Validate match status: innings 1 starts after the toss, innings 2 after the break
      if (dto.inningsNumber === 2) {
        if (match.status !== MatchStatus.INNINGS_BREAK) {
          throw new BadRequestException(
            'Second innings can only start after the first innings is completed',
          );
        }

        const firstInnings = await inningsRepository.findOne({
          where: { matchId, inningsNumber: 1 },
        });

        if (!firstInnings || !firstInnings.isCompleted) {
          throw new BadRequestException(
            'First innings must be completed before starting second innings',
          );
        }
      } else if (match.status !== MatchStatus.TOSS_DONE) {
        throw new BadRequestException('Toss must be done before starting innings');
      }

      // Validate teams
      if (
        match.teamAId !== dto.battingTeamId &&
        match.teamAId !== dto.bowlingTeamId
      ) {
        throw new BadRequestException('Teams must be part of the match');
      }

      if (dto.battingTeamId === dto.bowlingTeamId) {
        throw new BadRequestException('Batting and bowling teams must be different');
      }

      // Check if playing 11 is selected for both teams
      const teamAPlaying11 = await playing11Repository.count({
        where: { matchId, teamId: match.teamAId },
      });

      const teamBPlaying11 = await playing11Repository.count({
        where: { matchId, teamId: match.teamBId },
      });

      if (teamAPlaying11 !== 11 || teamBPlaying11 !== 11) {
        throw new BadRequestException('Both teams must select playing 11 before starting innings');
      }

      // Check if this innings number already exists
      const existingInnings = await inningsRepository.findOne({
        where: {
          matchId,
          inningsNumber: dto.inningsNumber,
        },
      });

      if (existingInnings) {
        throw new BadRequestException('Innings already exists');
      }

      // Create innings
      const innings = inningsRepository.create({
        matchId,
        inningsNumber: dto.inningsNumber,
        battingTeamId: dto.battingTeamId,
        bowlingTeamId: dto.bowlingTeamId,
        totalRuns: 0,
        totalWickets: 0,
        totalBalls: 0,
        currentOver: 0,
        isCompleted: false,
      });

      const savedInnings = await inningsRepository.save(innings);

      // Update match status
      match.status = MatchStatus.LIVE;
      match.currentInnings = dto.inningsNumber;
      await matchRepository.save(match);

      await queryRunner.commitTransaction();

      return savedInnings;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setBatsmen(inningsId: string, userId: string, dto: SetBatsmenDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inningsRepository = queryRunner.manager.getRepository(Innings);
      const playerRepository = queryRunner.manager.getRepository(Player);

      // Get innings
      const innings = await inningsRepository.findOne({
        where: { id: inningsId },
      });

      if (!innings) {
        throw new NotFoundException('Innings not found');
      }

      if (innings.isCompleted) {
        throw new BadRequestException('Cannot set batsmen for completed innings');
      }

      // Validate batsmen are from batting team
      const striker = await playerRepository.findOne({
        where: { id: dto.strikerId },
      });

      const nonStriker = await playerRepository.findOne({
        where: { id: dto.nonStrikerId },
      });

      if (!striker || !nonStriker) {
        throw new NotFoundException('One or both players not found');
      }

      if (striker.teamId !== innings.battingTeamId || nonStriker.teamId !== innings.battingTeamId) {
        throw new BadRequestException('Both batsmen must be from the batting team');
      }

      if (dto.strikerId === dto.nonStrikerId) {
        throw new BadRequestException('Striker and non-striker must be different players');
      }

      // Update innings
      innings.strikerId = dto.strikerId;
      innings.nonStrikerId = dto.nonStrikerId;
      await inningsRepository.save(innings);

      await queryRunner.commitTransaction();

      return innings;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setBowler(inningsId: string, userId: string, dto: SetBowlerDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inningsRepository = queryRunner.manager.getRepository(Innings);
      const playerRepository = queryRunner.manager.getRepository(Player);

      // Get innings
      const innings = await inningsRepository.findOne({
        where: { id: inningsId },
      });

      if (!innings) {
        throw new NotFoundException('Innings not found');
      }

      if (innings.isCompleted) {
        throw new BadRequestException('Cannot set bowler for completed innings');
      }

      // Validate bowler is from bowling team
      const bowler = await playerRepository.findOne({
        where: { id: dto.bowlerId },
      });

      if (!bowler) {
        throw new NotFoundException('Bowler not found');
      }

      if (bowler.teamId !== innings.bowlingTeamId) {
        throw new BadRequestException('Bowler must be from the bowling team');
      }

      // Update innings
      innings.currentBowlerId = dto.bowlerId;
      await inningsRepository.save(innings);

      await queryRunner.commitTransaction();

      return innings;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getInnings(inningsId: string) {
    const inningsRepository = this.dataSource.getRepository(Innings);

    const innings = await inningsRepository.findOne({
      where: { id: inningsId },
    });

    if (!innings) {
      throw new NotFoundException('Innings not found');
    }

    return innings;
  }

  async getMatchInnings(matchId: string) {
    const inningsRepository = this.dataSource.getRepository(Innings);

    const innings = await inningsRepository.find({
      where: { matchId },
      order: { inningsNumber: 'ASC' },
    });

    return innings;
  }
}
