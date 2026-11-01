import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamManagementController } from './team-management.controller';
import { TeamManagementService } from './team-management.service';
import { TeamPermissionGuard } from './team-permission.guard';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TeamAvailability } from '../match/team-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, TeamAvailability])],
  controllers: [TeamController, TeamManagementController],
  providers: [TeamService, TeamManagementService, TeamPermissionGuard],
  exports: [TeamService, TeamManagementService, TeamPermissionGuard],
})
export class TeamModule {}
