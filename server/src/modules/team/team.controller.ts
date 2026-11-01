import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamPermissionGuard } from './team-permission.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TeamRole } from './team-roles';

@ApiTags('Teams')
@Controller('team')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new team',
    description: `
    Create a new cricket team. The creator automatically becomes the captain.

    **Team Structure:**
    - One captain (team creator)
    - One vice-captain (optional)
    - One manager (optional)
    - Multiple players

    **Captain Privileges:**
    - Add/remove players
    - Transfer captaincy
    - Assign vice-captain and manager
    - Select Playing 11
    - Score matches
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Team created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Mumbai Indians',
          captainId: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-03-19T10:00:00.000Z',
        },
        message: 'Team created successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Team name already exists',
    schema: {
      example: {
        success: false,
        statusCode: 409,
        message: 'Team name already exists',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/team',
      },
    },
  })
  @ApiBody({ type: CreateTeamDto })
  async createTeam(@Request() req: any, @Body() dto: CreateTeamDto) {
    const team = await this.teamService.createTeam(req.user.userId, dto);
    return {
      data: team,
      message: 'Team created successfully',
    };
  }

  @Get('my-teams')
  @ApiOperation({
    summary: 'Get my teams',
    description: 'Get all teams the authenticated user is a member of',
  })
  @ApiResponse({
    status: 200,
    description: 'User teams retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Mumbai Indians',
            captainId: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: '2024-03-19T10:00:00.000Z',
          },
        ],
        message: 'My teams retrieved successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  async getMyTeams(@Request() req: any) {
    const teams = await this.teamService.getMyTeams(req.user.userId);
    return {
      data: teams,
      message: 'My teams retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get team details',
    description: 'Get detailed information about a specific team',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Team details retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Mumbai Indians',
          captainId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2024-03-19T10:00:00.000Z',
        },
        message: 'Team retrieved successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  async getTeam(@Param('id') id: string) {
    const team = await this.teamService.getTeam(id);
    return {
      data: team,
      message: 'Team retrieved successfully',
    };
  }

  @Patch(':id/transfer-captaincy')
  @UseGuards(TeamPermissionGuard)
  @Roles(TeamRole.CAPTAIN)
  @ApiOperation({
    summary: 'Transfer captaincy',
    description: `
    Transfer team captaincy to another team member.

    **Requirements:**
    - Must be current captain
    - New captain must be a team member

    **Effects:**
    - Old captain becomes regular player
    - New captain gets full captain privileges
    - Team captain_id is updated
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Captaincy transferred successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Mumbai Indians',
          captainId: '550e8400-e29b-41d4-a716-446655440001',
        },
        message: 'Captaincy transferred successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the captain',
    schema: {
      example: {
        success: false,
        statusCode: 403,
        message: 'Only current captain can transfer captaincy',
        timestamp: '2024-03-19T10:00:00.000Z',
        path: '/team/123/transfer-captaincy',
      },
    },
  })
  @ApiBody({ type: AssignRoleDto })
  async transferCaptaincy(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AssignRoleDto,
  ) {
    const team = await this.teamService.transferCaptaincy(
      id,
      req.user.userId,
      dto,
    );
    return {
      data: team,
      message: 'Captaincy transferred successfully',
    };
  }

  @Patch(':id/assign-vice-captain')
  @UseGuards(TeamPermissionGuard)
  @Roles(TeamRole.CAPTAIN)
  @ApiOperation({
    summary: 'Assign vice-captain',
    description: `
    Assign or reassign the vice-captain role.

    **Requirements:**
    - Must be captain
    - Target must be a team member

    **Note:** Only one vice-captain per team. Previous vice-captain becomes regular player.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vice-captain assigned successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the captain',
  })
  @ApiBody({ type: AssignRoleDto })
  async assignViceCaptain(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AssignRoleDto,
  ) {
    const teamMember = await this.teamService.assignViceCaptain(
      id,
      req.user.userId,
      dto,
    );
    return {
      data: teamMember,
      message: 'Vice-captain assigned successfully',
    };
  }
}
