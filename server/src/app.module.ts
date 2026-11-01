import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HealthController } from './common/controllers/health.controller';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TeamModule } from './modules/team/team.module';
import { PlayerModule } from './modules/player/player.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { MatchModule } from './modules/match/match.module';
import { Playing11Module } from './modules/playing11/playing11.module';
import { InningsModule } from './modules/innings/innings.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { StatsModule } from './modules/stats/stats.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),

    // Rate limiting: generous global guard rail; strict per-route limits on auth/OTP endpoints
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    TeamModule,
    PlayerModule,
    AvailabilityModule,
    MatchModule,
    Playing11Module,
    InningsModule,
    ScoringModule,
    StatsModule,
    GatewayModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
