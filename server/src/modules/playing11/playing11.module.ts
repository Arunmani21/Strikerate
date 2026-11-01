import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playing11Service } from './playing11.service';
import { Playing11Controller } from './playing11.controller';
import { Playing11 } from './playing11.entity';
import { Match } from '../match/match.entity';
import { Player } from '../player/player.entity';
import { PlayerAvailability } from '../player/player-availability.entity';
import { TeamMember } from '../team/team-member.entity';
import { GuestPlayer } from '../player/guest-player.entity';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Playing11,
      Match,
      Player,
      PlayerAvailability,
      TeamMember,
      GuestPlayer,
    ]),
    GatewayModule,
  ],
  controllers: [Playing11Controller],
  providers: [Playing11Service],
  exports: [Playing11Service],
})
export class Playing11Module {}
