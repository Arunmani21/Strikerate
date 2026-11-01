import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchStatusService } from './match-status.service';
import { MatchStatusController } from './match-status.controller';
import { SuperOverService } from './super-over.service';
import { SuperOverController } from './super-over.controller';
import { TeamAvailabilityController } from './team-availability.controller';
import { MatchRequestController } from './match-request.controller';
import { TossController } from './toss.controller';
import { TeamMatchesController } from './team-matches.controller';
import { Match } from './match.entity';
import { MatchRequest } from './match-request.entity';
import { TeamAvailability } from './team-availability.entity';
import { SuperOver } from './super-over.entity';
import { Team } from '../team/team.entity';
import { TeamMember } from '../team/team-member.entity';
import { MatchPermissionService } from '../../common/match-permission.service';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match,
      MatchRequest,
      TeamAvailability,
      SuperOver,
      Team,
      TeamMember,
    ]),
    GatewayModule,
  ],
  controllers: [
    MatchController,
    MatchStatusController,
    SuperOverController,
    TeamAvailabilityController,
    MatchRequestController,
    TossController,
    TeamMatchesController,
  ],
  providers: [MatchService, MatchStatusService, SuperOverService, MatchPermissionService],
  exports: [MatchService, MatchStatusService, SuperOverService, MatchPermissionService],
})
export class MatchModule {}
