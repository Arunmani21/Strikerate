import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InningsService } from './innings.service';
import { InningsController } from './innings.controller';
import { Innings } from './innings.entity';
import { Match } from '../match/match.entity';
import { Playing11 } from '../playing11/playing11.entity';
import { Player } from '../player/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Innings, Match, Playing11, Player]),
  ],
  controllers: [InningsController],
  providers: [InningsService],
  exports: [InningsService],
})
export class InningsModule {}
