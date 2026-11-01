import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [PlayerModule],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
