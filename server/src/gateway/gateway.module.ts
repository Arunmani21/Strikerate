import { Module } from '@nestjs/common';
import { CricketGateway } from './cricket.gateway';

/**
 * Gateway Module
 *
 * This module provides WebSocket gateway functionality for real-time match updates.
 * It can be imported into any module that needs to emit socket events.
 */
@Module({
  providers: [CricketGateway],
  exports: [CricketGateway], // Export so other modules can inject it
})
export class GatewayModule {}