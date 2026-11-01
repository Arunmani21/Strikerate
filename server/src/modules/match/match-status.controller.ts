import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchStatusService } from './match-status.service';
import { MatchStatus } from './match.entity';
import {
  AbandonMatchDto,
  CompleteMatchDto,
  DeclareMatchTiedDto,
  DeclareMatchDrawDto,
  DelayMatchDto,
  ResumeMatchDto,
  PostponeMatchDto,
  CancelMatchDto,
} from './dto/match-status.dto';

@ApiTags('Match Status Management')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MatchStatusController {
  constructor(private readonly matchStatusService: MatchStatusService) {}

  /**
   * MANUAL: Abandon match (rain, bad light, etc.)
   */
  @Post(':matchId/abandon')
  @ApiOperation({
    summary: 'Abandon match (Manual)',
    description: `
    **MANUAL STATUS UPDATE** 🛑

    Abandon a match due to weather, pitch conditions, or other reasons.
    This is for scenarios where automatic status updates don't apply.

    **When to Use:**
    - Rain makes field unplayable
    - Bad light stops play
    - Pitch conditions dangerous
    - Crowd trouble prevents play
    - Security concerns
    - Other external factors

    **Note:** Most status updates happen automatically via scoring system.
    Use this endpoint only for exceptional circumstances.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match abandoned successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'abandoned',
            abandonmentReason: 'rain',
            oversBowled: 35.4,
          },
          message: 'Match abandoned due to rain',
        },
      },
    },
  })
  async abandonMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: AbandonMatchDto,
  ) {
    const result = await this.matchStatusService.abandonMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match abandoned successfully',
    };
  }

  /**
   * MANUAL: Complete match with result
   */
  @Post(':matchId/complete')
  @ApiOperation({
    summary: 'Complete match (Manual)',
    description: `
    **MANUAL STATUS UPDATE** 🏁

    Manually complete a match and record the winner.
    Use this when automatic completion doesn't apply or needs manual override.

    **When to Use:**
    - Forfeited matches
    - Administrative completion
    - Tournament decisions
    - When scoring system auto-completion fails

    **Note:** Normal match completion happens automatically via scoring system.
    This is for exceptional circumstances only.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match completed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'completed',
            winningTeamId: 'team-a-id',
            marginOfVictory: '5 wickets',
          },
          message: 'Match completed. Team A won by 5 wickets',
        },
      },
    },
  })
  async completeMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: CompleteMatchDto,
  ) {
    const result = await this.matchStatusService.completeMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match completed successfully',
    };
  }

  /**
   * MANUAL: Declare match as tied
   */
  @Post(':matchId/tie')
  @ApiOperation({
    summary: 'Declare match as tied (Manual)',
    description: `
    **MANUAL STATUS UPDATE** 🤝

    Manually declare a match as tied.
    Use when automatic tie detection doesn't apply.

    **Note:** Ties are usually detected automatically by scoring system.
    This is for manual override only.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match declared as tied',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'tied',
          },
          message: 'Match declared as tied',
        },
      },
    },
  })
  async declareMatchTied(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: DeclareMatchTiedDto,
  ) {
    const result = await this.matchStatusService.declareMatchTied(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match declared as tied successfully',
    };
  }

  /**
   * MANUAL: Declare match as draw
   */
  @Post(':matchId/draw')
  @ApiOperation({
    summary: 'Declare match as drawn (Manual)',
    description: `
    **MANUAL STATUS UPDATE** 🎨

    Manually declare a match as drawn (mainly for Test matches).
    Use when automatic draw detection doesn't apply.

    **Note:** Draws are usually detected automatically by scoring system.
    This is for manual override only.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match declared as drawn',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'draw',
          },
          message: 'Match declared as drawn',
        },
      },
    },
  })
  async declareMatchDraw(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: DeclareMatchDrawDto,
  ) {
    const result = await this.matchStatusService.declareMatchDraw(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match declared as drawn successfully',
    };
  }

  /**
   * MANUAL: Delay match (rain, bad light)
   */
  @Post(':matchId/delay')
  @ApiOperation({
    summary: 'Delay match (Manual)',
    description: `
    **MANUAL STATUS UPDATE** ⛈️

    Manually delay match due to weather or other circumstances.

    **When to Use:**
    - Rain stops play (umpire decision)
    - Bad light conditions
    - Other external delays

    **Note:** Some delays may be detected automatically in future versions.
    Currently requires manual intervention.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match delayed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'rain_delayed',
          },
          message: 'Match delayed due to rain. Expected to resume in 45 minutes',
        },
      },
    },
  })
  async delayMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: DelayMatchDto,
  ) {
    const result = await this.matchStatusService.delayMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match delayed successfully',
    };
  }

  /**
   * MANUAL: Resume match after delay
   */
  @Post(':matchId/resume')
  @ApiOperation({
    summary: 'Resume match after delay (Manual)',
    description: `
    **MANUAL STATUS UPDATE** ▶️

    Manually resume match after rain, bad light, or other delays.

    **When to Use:**
    - Rain stopped and play can resume
    - Light improved and match can continue
    - Delay conditions resolved

    **Note:** Resume is a manual decision by umpires.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match resumed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'live',
          },
          message: 'Match resumed after 75 minutes delay',
        },
      },
    },
  })
  async resumeMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: ResumeMatchDto,
  ) {
    const result = await this.matchStatusService.resumeMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match resumed successfully',
    };
  }

  /**
   * MANUAL: Postpone match to later date
   */
  @Post(':matchId/postpone')
  @ApiOperation({
    summary: 'Postpone match (Manual)',
    description: `
    **MANUAL STATUS UPDATE** 📅

    Postpone a scheduled match to a later date.
    This is for pre-match postponements only.

    **When to Use:**
    - Weather prevents match from starting
    - Venue availability issues
    - Team unavailability
    - Tournament decisions

    **Note:** Can only postpone scheduled matches, not live matches.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match postponed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'postponed',
          },
          message: 'Match postponed to 2026-04-15 at 14:30',
        },
      },
    },
  })
  async postponeMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: PostponeMatchDto,
  ) {
    const result = await this.matchStatusService.postponeMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match postponed successfully',
    };
  }

  /**
   * MANUAL: Cancel match
   */
  @Post(':matchId/cancel')
  @ApiOperation({
    summary: 'Cancel match (Manual)',
    description: `
    **MANUAL STATUS UPDATE** ❌

    Cancel a scheduled match before it starts.
    This is permanent and cannot be undone.

    **When to Use:**
    - Both teams agree to cancel
    - Team withdrawals
    - Venue unavailability
    - Force majeure events

    **Note:** Can only cancel scheduled matches before toss.
    Cannot cancel once match is in progress.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match cancelled successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          match: {
            id: 'match-id',
            status: 'cancelled',
          },
          message: 'Match cancelled successfully',
        },
      },
    },
  })
  async cancelMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: CancelMatchDto,
  ) {
    const result = await this.matchStatusService.cancelMatch(
      matchId,
      dto,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Match cancelled successfully',
    };
  }

  /**
   * GET: Live matches
   */
  @Get('status/live')
  @ApiOperation({
    summary: 'Get all live matches',
    description: 'Get all matches currently in progress (LIVE status).',
  })
  @ApiResponse({
    status: 200,
    description: 'Live matches retrieved successfully',
  })
  async getLiveMatches() {
    const matches = await this.matchStatusService.getLiveMatches();

    return {
      success: true,
      statusCode: 200,
      data: matches,
      message: 'Live matches retrieved successfully',
    };
  }

  /**
   * GET: Upcoming matches
   */
  @Get('status/upcoming')
  @ApiOperation({
    summary: 'Get upcoming scheduled matches',
    description: 'Get all scheduled matches that are yet to start.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming matches retrieved successfully',
  })
  async getUpcomingMatches() {
    const matches = await this.matchStatusService.getUpcomingMatches();

    return {
      success: true,
      statusCode: 200,
      data: matches,
      message: 'Upcoming matches retrieved successfully',
    };
  }

  /**
   * GET: Completed matches
   */
  @Get('status/completed')
  @ApiOperation({
    summary: 'Get completed matches',
    description: 'Get all matches that have finished with a result.',
  })
  @ApiResponse({
    status: 200,
    description: 'Completed matches retrieved successfully',
  })
  async getCompletedMatches() {
    const matches = await this.matchStatusService.getCompletedMatches();

    return {
      success: true,
      statusCode: 200,
      data: matches,
      message: 'Completed matches retrieved successfully',
    };
  }

  /**
   * GET: Matches by status
   */
  @Get('status/:status')
  @ApiOperation({
    summary: 'Get matches by status',
    description: 'Get all matches with a specific status.',
  })
  @ApiParam({
    name: 'status',
    description: 'Match status to filter by',
    enum: MatchStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Matches retrieved successfully',
  })
  async getMatchesByStatus(@Param('status') status: MatchStatus) {
    const matches = await this.matchStatusService.getMatchesByStatus(status);

    return {
      success: true,
      statusCode: 200,
      data: matches,
      message: 'Matches retrieved successfully',
    };
  }
}
