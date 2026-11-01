import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { GuestPlayerController } from './guest-player.controller';
import { GuestPlayerService } from './guest-player.service';
import { Player } from './player.entity';
import { PlayerAvailability } from './player-availability.entity';
import { GuestPlayer } from './guest-player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerAvailability, GuestPlayer])],
  controllers: [PlayerController, GuestPlayerController],
  providers: [PlayerService, GuestPlayerService],
  exports: [PlayerService, GuestPlayerService],
})
export class PlayerModule {}
