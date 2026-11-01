import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuestPlayerService } from './guest-player.service';
import {
  CreateGuestPlayerDto,
  UpdateGuestPlayerDto,
  ConvertGuestPlayerDto,
} from './dto/guest-player.dto';

@ApiTags('Guest Player Management')
@Controller('guest-player')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GuestPlayerController {
  constructor(private readonly guestPlayerService: GuestPlayerService) {}

  /**
   * Add a guest player to a team
   */
  @Post('team/:teamId')
  @ApiOperation({
    summary: 'Add guest player to team',
    description: `
    Add a temporary guest player to a team without requiring registration.
    Useful for last-minute substitutions or temporary players.

    **Use Cases:**
    - Last-minute player cancellation
    - Temporary substitute for a match
    - Trial players before正式 joining
    - Friends filling in for regular players

    **Required:**
    - Team ID (must be captain/manager)
    - Guest player name

    **Optional:**
    - Mobile number (for contact)
    - Email address
    - Batting/bowling style
    - Player role
    - Match-specific guest (provide matchId)
    `,
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID to add guest player to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Guest player added successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          teamId: '550e8400-e29b-41d4-a716-446655440000',
          matchId: null,
          name: 'Rahul Sharma',
          mobile: '+919876543210',
          email: null,
          battingStyle: 'right_hand',
          bowlingStyle: 'right_arm_fast',
          role: 'allrounder',
          status: 'active',
          isConverted: false,
          addedBy: 'user-id',
          createdAt: '2026-04-08T10:00:00.000Z',
        },
        message: 'Guest player added successfully',
        timestamp: '2026-04-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 409, description: 'Guest player already exists' })
  async addGuestPlayer(
    @Param('teamId') teamId: string,
    @Body() dto: CreateGuestPlayerDto,
    @Request() req: any,
    @Query('matchId') matchId?: string,
  ) {
    const guestPlayer = await this.guestPlayerService.addGuestPlayer(
      teamId,
      dto,
      req.user.userId,
      matchId,
    );

    return {
      data: guestPlayer,
      message: 'Guest player added successfully',
    };
  }

  /**
   * Get all guest players for a team
   */
  @Get('team/:teamId')
  @ApiOperation({
    summary: 'Get team guest players',
    description: 'Get all active guest players for a specific team',
  })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'Guest players retrieved successfully',
  })
  async getTeamGuestPlayers(@Param('teamId') teamId: string) {
    const guestPlayers = await this.guestPlayerService.getTeamGuestPlayers(
      teamId,
    );

    return {
      data: guestPlayers,
      message: 'Guest players retrieved successfully',
    };
  }

  /**
   * Get guest players by match
   */
  @Get('match/:matchId')
  @ApiOperation({
    summary: 'Get match guest players',
    description: 'Get all guest players added for a specific match',
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match guest players retrieved successfully',
  })
  async getMatchGuestPlayers(@Param('matchId') matchId: string) {
    const guestPlayers = await this.guestPlayerService.getMatchGuestPlayers(
      matchId,
    );

    return {
      data: guestPlayers,
      message: 'Match guest players retrieved successfully',
    };
  }

  /**
   * Get a specific guest player
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get guest player details',
    description: 'Get detailed information about a specific guest player',
  })
  @ApiParam({ name: 'id', description: 'Guest player ID' })
  @ApiResponse({ status: 200, description: 'Guest player retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Guest player not found' })
  async getGuestPlayer(@Param('id') id: string) {
    const guestPlayer = await this.guestPlayerService.getGuestPlayer(id);

    return {
      data: guestPlayer,
      message: 'Guest player retrieved successfully',
    };
  }

  /**
   * Update guest player details
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update guest player',
    description: 'Update guest player information (name, contact, style, etc.)',
  })
  @ApiParam({ name: 'id', description: 'Guest player ID' })
  @ApiResponse({ status: 200, description: 'Guest player updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update converted guest player' })
  @ApiResponse({ status: 404, description: 'Guest player not found' })
  async updateGuestPlayer(
    @Param('id') id: string,
    @Body() dto: UpdateGuestPlayerDto,
  ) {
    const guestPlayer = await this.guestPlayerService.updateGuestPlayer(
      id,
      dto,
    );

    return {
      data: guestPlayer,
      message: 'Guest player updated successfully',
    };
  }

  /**
   * Deactivate a guest player
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Deactivate guest player',
    description: 'Deactivate a guest player (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Guest player ID' })
  @ApiResponse({
    status: 200,
    description: 'Guest player deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Guest player not found' })
  async deactivateGuestPlayer(@Param('id') id: string) {
    await this.guestPlayerService.deactivateGuestPlayer(id);

    return {
      message: 'Guest player deactivated successfully',
    };
  }

  /**
   * Convert guest player to regular player
   */
  @Post(':id/convert')
  @ApiOperation({
    summary: 'Convert guest to regular player',
    description: `
    Convert a guest player into a regular player with full user account.
    Creates a new user account, player profile, and links to the team.

    **Process:**
    - Creates new user account with provided email/password
    - Creates player profile with guest player's information
    - Adds player to the same team
    - Marks guest player as converted (inactive)
    - Guest statistics can be preserved if needed

    **Result:**
    - Guest becomes a regular team member
    - Can login with email/password
    - Full access to app features
    - Can be added to future matches

    **Note:** Email must be unique and not already registered.
    `,
  })
  @ApiParam({ name: 'id', description: 'Guest player ID to convert' })
  @ApiResponse({
    status: 201,
    description: 'Guest player converted successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          user: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Rahul Sharma',
            email: 'rahul@example.com',
            emailVerified: false,
            createdAt: '2026-04-08T10:00:00.000Z',
          },
          player: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            teamId: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440002',
            playerRole: 'player',
            isActive: true,
          },
        },
        message: 'Guest player converted to regular player successfully',
        timestamp: '2026-04-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Guest player already converted' })
  @ApiResponse({ status: 404, description: 'Guest player not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async convertGuestPlayer(
    @Param('id') id: string,
    @Body() dto: ConvertGuestPlayerDto,
  ) {
    const result = await this.guestPlayerService.convertGuestPlayer(id, dto);

    return {
      data: result,
      message: 'Guest player converted to regular player successfully',
    };
  }

  /**
   * Check if guest player can play in match
   */
  @Get(':id/can-play/:matchId')
  @ApiOperation({
    summary: 'Check if guest can play in match',
    description: 'Check if a guest player is eligible to play in a specific match',
  })
  @ApiParam({ name: 'id', description: 'Guest player ID' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Check completed',
    schema: {
      example: {
        success: true,
        data: { canPlay: true, reason: 'Guest player is active and eligible' },
        message: 'Guest player eligibility checked',
      },
    },
  })
  async canPlayInMatch(
    @Param('id') id: string,
    @Param('matchId') matchId: string,
  ) {
    const canPlay = await this.guestPlayerService.canPlayInMatch(id, matchId);

    return {
      data: {
        canPlay,
        reason: canPlay
          ? 'Guest player is active and eligible'
          : 'Guest player is not eligible for this match',
      },
      message: 'Guest player eligibility checked',
    };
  }
}
