import {
  Controller,
  Post,
  Get,
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
import { RetireHurtService } from './retire-hurt.service';
import {
  RetireHurtDto,
  ReturnFromRetirementDto,
  SubstituteFielderDto,
} from './dto/retire-hurt.dto';

@ApiTags('Scoring - Retire Hurt')
@Controller('scoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RetireHurtController {
  constructor(private readonly retireHurtService: RetireHurtService) {}

  /**
   * Retire batsman hurt
   */
  @Post('innings/:inningsId/retire-hurt')
  @ApiOperation({
    summary: 'Retire batsman hurt',
    description: `
    Handle the scenario when a batsman gets injured or ill and has to leave the field.
    The batsman is NOT marked as out and can potentially return later to continue their innings.

    **Common Scenarios:**
    - **Injury**: Hamstring strain, twisted ankle, muscle pull
    - **Illness**: Dehydration, heat exhaustion, sickness
    - **Emergency**: Personal emergency, family issue
    - **Other**: Any other reason requiring temporary leave

    **Process:**
    - Batsman's current score and balls faced are preserved
    - Marked as "retired hurt" (not out)
    - Next batsman comes in to continue innings
    - Can return later to resume batting (if not out)

    **Rules:**
    - Retired hurt batsman can return at any time
    - Cannot return if innings has ended
    - Cannot return if already gotten out while retired
    - Return requires approval from opposition captain (traditional cricket)

    **Example:**
    Virat Kohli gets injured on 45(32), retires hurt, returns later at 67(52)
    `,
  })
  @ApiParam({
    name: 'inningsId',
    description: 'Innings ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Batsman retired hurt successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          performance: {
            id: 'perf-id',
            playerId: 'player-id',
            runsScored: 45,
            ballsFaced: 32,
            isRetiredHurt: true,
            retiredHurtAt: '2026-04-08T10:30:00.000Z',
            retiredHurtBallNumber: '45.3',
          },
          message: 'Injury - Player retired hurt',
        },
        message: 'Batsman retired hurt successfully',
        timestamp: '2026-04-08T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Player already out or retired hurt' })
  @ApiResponse({ status: 404, description: 'Innings not found' })
  async retireHurt(
    @Param('inningsId') inningsId: string,
    @Request() req: any,
    @Body() dto: RetireHurtDto,
  ) {
    const result = await this.retireHurtService.retireHurt(inningsId, req.user.userId, dto);

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Batsman retired hurt successfully',
    };
  }

  /**
   * Return from retirement
   */
  @Post('innings/:inningsId/return-from-retirement')
  @ApiOperation({
    summary: 'Return from retirement',
    description: `
    Allow a retired hurt batsman to return and continue their innings.

    **Rules:**
    - Can only return if currently retired hurt
    - Cannot return if already returned once
    - Cannot return if innings has ended
    - Cannot return if gotten out while retired
    - Resumes from where they left off

    **Statistics:**
    - Previous runs and balls faced are preserved
    - Continue adding to their existing score
    - Not counted as a new innings

    **Example:**
    Kohli retired hurt on 45(32), returns later and gets to 67(52)
    - Score shows: 67 runs off 52 balls
    - Not counted as retired hurt in final stats
    `,
  })
  @ApiParam({
    name: 'inningsId',
    description: 'Innings ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Player returned from retirement successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          performance: {
            id: 'perf-id',
            playerId: 'player-id',
            runsScored: 45,
            ballsFaced: 32,
            isRetiredHurt: true,
            returnedFromRetirement: true,
            returnedAtBall: 67,
          },
          message: 'Player has returned from retirement and can continue batting',
        },
        message: 'Player returned from retirement successfully',
        timestamp: '2026-04-08T10:35:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Player cannot return from retirement' })
  @ApiResponse({ status: 404, description: 'Innings or player not found' })
  async returnFromRetirement(
    @Param('inningsId') inningsId: string,
    @Request() req: any,
    @Body() dto: ReturnFromRetirementDto,
  ) {
    const result = await this.retireHurtService.returnFromRetirement(
      inningsId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Player returned from retirement successfully',
    };
  }

  /**
   * Get retired hurt players in an innings
   */
  @Get('innings/:inningsId/retired-hurt-players')
  @ApiOperation({
    summary: 'Get retired hurt players',
    description: `
    Get all players who are currently retired hurt and haven't returned yet.
    Useful for deciding when to bring them back to bat.
    `,
  })
  @ApiParam({
    name: 'inningsId',
    description: 'Innings ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Retired hurt players retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 'perf-id',
            playerId: 'player-id',
            runsScored: 45,
            ballsFaced: 32,
            isRetiredHurt: true,
            retiredHurtAt: '2026-04-08T10:30:00.000Z',
            retiredHurtBallNumber: '45.3',
            returnedFromRetirement: false,
          },
        ],
        message: 'Retired hurt players retrieved successfully',
        timestamp: '2026-04-08T10:32:00.000Z',
      },
    },
  })
  async getRetiredHurtPlayers(@Param('inningsId') inningsId: string) {
    const players = await this.retireHurtService.getRetiredHurtPlayers(inningsId);

    return {
      success: true,
      statusCode: 200,
      data: players,
      message: 'Retired hurt players retrieved successfully',
    };
  }

  /**
   * Check if player can return from retirement
   */
  @Get('innings/:inningsId/can-return/:playerId')
  @ApiOperation({
    summary: 'Check if player can return',
    description: `
    Check if a specific player is eligible to return from retirement.
    Useful for captains and scorers to make decisions.
    `,
  })
  @ApiParam({ name: 'inningsId', description: 'Innings ID' })
  @ApiParam({ name: 'playerId', description: 'Player ID' })
  @ApiResponse({
    status: 200,
    description: 'Check completed',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          canReturn: true,
          reason: 'Player is retired hurt and can return to continue batting',
        },
        message: 'Return eligibility checked',
        timestamp: '2026-04-08T10:32:00.000Z',
      },
    },
  })
  async canPlayerReturn(
    @Param('inningsId') inningsId: string,
    @Param('playerId') playerId: string,
  ) {
    const canReturn = await this.retireHurtService.canPlayerReturn(
      inningsId,
      playerId,
    );

    return {
      success: true,
      statusCode: 200,
      data: {
        canReturn,
        reason: canReturn
          ? 'Player is retired hurt and can return to continue batting'
          : 'Player cannot return from retirement',
      },
      message: 'Return eligibility checked',
    };
  }

  /**
   * Handle substitute fielder
   */
  @Post('matches/:matchId/substitute-fielder')
  @ApiOperation({
    summary: 'Record substitute fielder (not implemented)',
    description: `
    Intended to record when a player needs a substitute fielder due to injury or other reasons.

    **Status:** Not implemented — substitutions are not persisted yet, so this
    endpoint always responds with 501 instead of recording fake state.
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: 'Match ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 501, description: 'Not implemented — substitutions are not persisted yet' })
  async handleSubstituteFielder(
    @Param('matchId') matchId: string,
    @Body() dto: SubstituteFielderDto,
  ) {
    const result = await this.retireHurtService.handleSubstituteFielder(
      matchId,
      dto,
    );

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Substitute fielder recorded successfully',
    };
  }

  /**
   * Get retirement statistics for a match
   */
  @Get('matches/:matchId/retirement-stats')
  @ApiOperation({
    summary: 'Get retirement statistics',
    description: `
    Get comprehensive retirement statistics for a match.
    Useful for match reports and analysis.
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: 'Match ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Retirement statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          totalRetirements: 3,
          returnedPlayers: 2,
          currentlyRetired: [
            {
              id: 'perf-id',
              playerId: 'player-id',
              runsScored: 23,
              ballsFaced: 18,
              isRetiredHurt: true,
            },
          ],
        },
        message: 'Retirement statistics retrieved successfully',
        timestamp: '2026-04-08T10:35:00.000Z',
      },
    },
  })
  async getRetirementStats(@Param('matchId') matchId: string) {
    const stats = await this.retireHurtService.getRetirementStats(matchId);

    return {
      success: true,
      statusCode: 200,
      data: stats,
      message: 'Retirement statistics retrieved successfully',
    };
  }
}
