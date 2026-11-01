import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { RetireHurtService } from './retire-hurt.service';
import { RetireHurtController } from './retire-hurt.controller';
import { ScorerTransferService } from './scorer-transfer.service';
import { ScorerTransferController } from './scorer-transfer.controller';
import { Ball } from './ball.entity';
import { Innings } from '../innings/innings.entity';
import { Match } from '../match/match.entity';
import { Player } from '../player/player.entity';
import { PlayerMatchPerformance } from '../stats/player-match-performance.entity';
import { ScorerPermission } from './scorer-permission.entity';
import { User } from '../user/user.entity';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ball, Innings, Match, Player, PlayerMatchPerformance, ScorerPermission, User]),
    GatewayModule,
  ],
  controllers: [ScoringController, RetireHurtController, ScorerTransferController],
  providers: [ScoringService, RetireHurtService, ScorerTransferService],
  exports: [ScoringService, RetireHurtService, ScorerTransferService],
})
export class ScoringModule {}
