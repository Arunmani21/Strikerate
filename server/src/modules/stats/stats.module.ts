import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PlayerMatchPerformance } from './player-match-performance.entity';
import { PlayerCareerStats } from './player-career-stats.entity';
import { TeamMatchHistory } from './team-match-history.entity';
import { Match } from '../match/match.entity';
import { Innings } from '../innings/innings.entity';
import { Ball } from '../scoring/ball.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { Player } from '../player/player.entity';
import { MatchPermissionService } from '../../common/match-permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerMatchPerformance,
      PlayerCareerStats,
      TeamMatchHistory,
      Match,
      Innings,
      Ball,
      Playing11,
      Player,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService, MatchPermissionService],
  exports: [StatsService],
})
export class StatsModule {}