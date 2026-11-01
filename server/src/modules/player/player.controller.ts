import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
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
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerAvailabilityDto, PlayerAvailabilityDto } from './dto/player-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamPermissionGuard } from '../team/team-permission.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TeamRole } from '../team/team-roles';

@ApiTags('Players')
@Controller('team/:teamId/player')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post()
  @UseGuards(TeamPermissionGuard)
  @Roles(TeamRole.CAPTAIN)
  @ApiOperation({
    summary: 'Add player to team',
    description: `
    Add a new player to the team.

    **Requirements:**
    - Must be captain or manager of the team
    - Player name must be unique within the team
    - Optional: Link to existing user account

    **Effects:**
    - Creates player record with statistics
    - If userId provided, adds user to team_members
    - Initializes all statistics to 0
    `,
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Player added successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Virat Kohli',
          jerseyNumber: 18,
          teamId: '550e8400-e29b-41d4-a716-446655440000',
          battingRuns: 0,
          battingBalls: 0,
          battingFours: 0,
          battingSixes: 0,
          battingStrikeRate: 0,
          bowlingBalls: 0,
          bowlingRuns: 0,
          bowlingWickets: 0,
          bowlingEconomy: 0,
          bowlingOvers: 0,
          isOut: false,
        },
        message: 'Player added successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Player name already exists in team',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not captain or manager',
  })
  @ApiBody({ type: CreatePlayerDto })
  async addPlayer(
    @Param('teamId') teamId: string,
    @Body() dto: CreatePlayerDto,
  ) {
    const player = await this.playerService.addPlayer(teamId, dto);
    return {
      data: player,
      message: 'Player added successfully',
    };
  }

  @Delete(':playerId')
  @UseGuards(TeamPermissionGuard)
  @Roles(TeamRole.CAPTAIN)
  @ApiOperation({
    summary: 'Remove player from team',
    description: `
    Remove a player from the team.

    **Requirements:**
    - Must be captain or manager of the team
    - Player must not be in any live match

    **Note:** Cannot remove players during live matches
    `,
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'playerId',
    description: 'Player ID to remove',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Player removed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'Player removed successfully',
        },
        message: 'Player removed successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not captain or manager',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove player during live match',
  })
  async removePlayer(
    @Param('teamId') teamId: string,
    @Param('playerId') playerId: string,
  ) {
    const result = await this.playerService.removePlayer(teamId, playerId);
    return {
      data: result,
      message: 'Player removed successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all team players',
    description: `
    Get all players in the team.

    **Returns:**
    - Complete player list with statistics
    - Ordered alphabetically by name
    - Includes both batting and bowling stats
    `,
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Players retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Rohit Sharma',
            jerseyNumber: 45,
            battingRuns: 1250,
            battingBalls: 800,
            battingFours: 120,
            battingSixes: 45,
            battingStrikeRate: 156.25,
            bowlingBalls: 0,
            bowlingRuns: 0,
            bowlingWickets: 0,
            bowlingEconomy: 0,
            bowlingOvers: 0,
            isOut: false,
            teamId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        message: 'Players retrieved successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  async getTeamPlayers(@Param('teamId') teamId: string) {
    const players = await this.playerService.getTeamPlayers(teamId);
    return {
      data: players,
      message: 'Players retrieved successfully',
    };
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get available players by date',
    description: `
    Get players available for a specific date.

    **Parameters:**
    - date: Date to check availability (YYYY-MM-DD format)

    **Returns:**
    - Only players marked as available on the date
    - Players without availability records are assumed available
    - Used for Playing 11 selection
    `,
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date to check availability (YYYY-MM-DD format)',
    example: '2024-03-20',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Available players retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Rohit Sharma',
            jerseyNumber: 45,
            isAvailable: true,
            battingRuns: 1250,
            battingBalls: 800,
            battingStrikeRate: 156.25,
            teamId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        message: 'Available players retrieved successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format',
  })
  async getAvailablePlayers(
    @Param('teamId') teamId: string,
    @Query('date') date: string,
  ) {
    const players = await this.playerService.getAvailablePlayers(teamId, date);
    return {
      data: players,
      message: 'Available players retrieved successfully',
    };
  }
}
