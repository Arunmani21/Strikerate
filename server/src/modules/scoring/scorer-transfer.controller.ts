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
import { ScorerTransferService } from './scorer-transfer.service';
import {
  TransferScorerDto,
  AcceptScorerTransferDto,
  RejectScorerTransferDto,
  RevokeScorerAccessDto,
  GrantScorerAccessDto,
  UpdateScorerRoleDto,
} from './dto/scorer-transfer.dto';

@ApiTags('Scoring - Scorer Transfer')
@Controller('scoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScorerTransferController {
  constructor(private readonly scorerTransferService: ScorerTransferService) {}

  /**
   * Transfer scorer permissions - THE MAIN FEATURE
   */
  @Post('matches/:matchId/transfer-scorer')
  @ApiOperation({
    summary: 'Transfer scorer permissions',
    description: `
    **THE "SCORER HANDOFF" FEATURE** 🎯

    When the current scorer needs to pass scoring duties to someone else mid-match.
    Perfect for when the scorer has to go bat, take a break, or attend to an emergency.

    **Common Use Cases:**
    - **Scorer has to bat**: "I'm opening in 5 mins, take over scoring"
    - **Need a break**: "Going for lunch, handle scoring for 30 mins"
    - **Emergency**: "Need to step away temporarily"
    - **Permanent handoff**: "You handle the rest of the match"

    **How It Works:**
    1. Current scorer selects team member to transfer to
    2. Sets reason and estimated time away
    3. Target user gets notification (via WebSocket)
    4. Target user accepts the transfer
    5. Scoring permissions are immediately activated
    6. Current scorer can optionally revoke their own permissions
    7. Transfer is logged in match history

    **Real-World Example:**
    Virat is scoring the first innings. Now he has to open the batting in second innings.
    He transfers scoring to Rohit via "Transfer Scorer" button. Rohit accepts and takes over.
    Virat goes to bat, knowing Rohit has the scoring covered.

    **Features:**
    - ✅ Real-time permission transfer
    - ✅ Audit trail of who scored when
    - ✅ Optional permission revocation
    - ✅ Role-based access control
    - ✅ Accept/Reject workflow
    - ✅ Transfer history tracking
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: 'Match ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Scorer transfer initiated successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          transfer: {
            id: 'transfer-id',
            matchId: 'match-id',
            userId: 'rohit-id',
            role: 'primary_scorer',
            isActive: false,
            canScore: false,
            transferredFrom: 'virat-id',
            transferredTo: 'rohit-id',
            transferStatus: 'pending',
            transferredAt: '2026-04-08T14:30:00.000Z',
            transferReason: 'Need to go bat in second innings',
          },
          message: 'Scoring permissions transferred to Rohit Sharma. Waiting for acceptance.',
        },
        message: 'Scorer transfer initiated successfully',
        timestamp: '2026-04-08T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'You do not have scoring permissions' })
  @ApiResponse({ status: 404, description: 'Match or user not found' })
  async transferScorer(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: TransferScorerDto,
  ) {
    const result = await this.scorerTransferService.transferScorer(
      matchId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Scorer transfer initiated successfully',
    };
  }

  /**
   * Accept scorer transfer
   */
  @Post('accept-scorer-transfer')
  @ApiOperation({
    summary: 'Accept scorer transfer request',
    description: `
    Accept a pending scorer transfer request and activate scoring permissions.

    **Process:**
    - User gets notification of pending transfer
    - Reviews transfer details and reason
    - Accepts the transfer
    - Permissions are activated immediately (if chosen)
    - Can start scoring right away

    **Example:**
    Rohit receives notification: "Virat transferred scoring to you - Need to go bat"
    Rohit accepts with "activateImmediately: true"
    Rohit can now score the match immediately
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Scorer transfer accepted successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          permission: {
            id: 'permission-id',
            role: 'primary_scorer',
            isActive: true,
            canScore: true,
            transferStatus: 'accepted',
            acceptedAt: '2026-04-08T14:31:00.000Z',
          },
          message: 'Scoring permissions activated successfully. You can now score this match.',
        },
        message: 'Scorer transfer accepted successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Transfer cannot be accepted' })
  @ApiResponse({ status: 404, description: 'Transfer request not found' })
  async acceptScorerTransfer(
    @Request() req: any,
    @Body() dto: AcceptScorerTransferDto,
  ) {
    const result = await this.scorerTransferService.acceptScorerTransfer(
      dto.transferRequestId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Scorer transfer accepted successfully',
    };
  }

  /**
   * Reject scorer transfer
   */
  @Post('reject-scorer-transfer')
  @ApiOperation({
    summary: 'Reject scorer transfer request',
    description: `
    Reject a pending scorer transfer request.

    **Common Reasons:**
    - Busy with other responsibilities
    - Don't have scoring experience
    - Not available at the moment
    - Someone else should handle it

    **Example:**
    Rohit receives transfer but is busy batting
    He rejects with "Busy with other tasks"
    Original scorer needs to transfer to someone else
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Scorer transfer rejected successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'Scorer transfer rejected successfully',
        },
        message: 'Scorer transfer rejected successfully',
      },
    },
  })
  async rejectScorerTransfer(
    @Request() req: any,
    @Body() dto: RejectScorerTransferDto,
  ) {
    const result = await this.scorerTransferService.rejectScorerTransfer(
      dto.transferRequestId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Scorer transfer rejected successfully',
    };
  }

  /**
   * Revoke scorer access
   */
  @Put('matches/:matchId/revoke-scorer-access')
  @ApiOperation({
    summary: 'Revoke scoring access from user',
    description: `
    Revoke active scoring permissions from a user.

    **Use Cases:**
    - Scorer is done with their duties
    - Need to remove problematic scorer
    - Temporary scorer no longer needed
    - Emergency revocation

    **Permissions:**
    - Only captain, manager, or original transferor can revoke
    - Cannot revoke if you don't have revoke permissions
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Scoring access revoked successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'Scoring access revoked successfully',
        },
        message: 'Scoring access revoked successfully',
      },
    },
  })
  async revokeScorerAccess(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: RevokeScorerAccessDto,
  ) {
    const result = await this.scorerTransferService.revokeScorerAccess(
      matchId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Scoring access revoked successfully',
    };
  }

  /**
   * Grant scorer access
   */
  @Post('matches/:matchId/grant-scorer-access')
  @ApiOperation({
    summary: 'Grant scoring access to user',
    description: `
    Directly grant scoring access to a team member (without transfer workflow).

    **Use Cases:**
    - Set up primary scorers before match
    - Add secondary scorers for assistance
    - Give team members scoring access

    **Roles Available:**
    - primary_scorer: Full scoring access
    - secondary_scorer: Can assist with scoring
    - temporary_scorer: Short-term scoring access
    - viewer: Can only view, not score

    **Permissions:**
    - Only captain, manager, or current scorer can grant access
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 201,
    description: 'Scoring access granted successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          permission: {
            id: 'permission-id',
            userId: 'user-id',
            role: 'secondary_scorer',
            isActive: true,
            canScore: true,
          },
          message: 'Scoring access granted to Rohit Sharma',
        },
        message: 'Scoring access granted successfully',
      },
    },
  })
  async grantScorerAccess(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: GrantScorerAccessDto,
  ) {
    const result = await this.scorerTransferService.grantScorerAccess(
      matchId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 201,
      data: result,
      message: 'Scoring access granted successfully',
    };
  }

  /**
   * Update scorer role
   */
  @Put('matches/:matchId/update-scorer-role')
  @ApiOperation({
    summary: 'Update scorer role',
    description: `
    Change the role and permissions of an active scorer.

    **Use Cases:**
    - Promote secondary scorer to primary scorer
    - Demote primary scorer to secondary scorer
    - Change scorer responsibilities mid-match

    **Role Changes:**
    - primary_scorer → secondary_scorer: Reduce responsibilities
    - secondary_scorer → primary_scorer: Promote to main scorer
    - Any role → viewer: Remove scoring access
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Scorer role updated successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          permission: {
            id: 'permission-id',
            userId: 'user-id',
            role: 'primary_scorer',
            isActive: true,
            canScore: true,
          },
          message: 'Scorer role updated successfully',
        },
        message: 'Scorer role updated successfully',
      },
    },
  })
  async updateScorerRole(
    @Param('matchId') matchId: string,
    @Request() req: any,
    @Body() dto: UpdateScorerRoleDto,
  ) {
    const result = await this.scorerTransferService.updateScorerRole(
      matchId,
      req.user.userId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Scorer role updated successfully',
    };
  }

  /**
   * Get all scorers for a match
   */
  @Get('matches/:matchId/scorers')
  @ApiOperation({
    summary: 'Get all scorers for a match',
    description: `
    Get comprehensive list of all scorers associated with a match,
    including active, inactive, pending, and completed transfers.

    **Returns:**
    - Current active scorers
    - Transfer history
    - Permission status
    - Role information
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Scorers retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 'permission-id',
            userId: 'user-id',
            role: 'primary_scorer',
            isActive: true,
            canScore: true,
            user: {
              id: 'user-id',
              name: 'Virat Kohli',
            },
          },
        ],
        message: 'Scorers retrieved successfully',
      },
    },
  })
  async getMatchScorers(@Param('matchId') matchId: string) {
    const scorers = await this.scorerTransferService.getMatchScorers(matchId);

    return {
      success: true,
      statusCode: 200,
      data: scorers,
      message: 'Scorers retrieved successfully',
    };
  }

  /**
   * Get active scorers for a match
   */
  @Get('matches/:matchId/active-scorers')
  @ApiOperation({
    summary: 'Get active scorers for a match',
    description: `
    Get currently active scorers who can score the match.
    Useful for displaying current scoring team in the UI.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Active scorers retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 'permission-id',
            userId: 'user-id',
            role: 'primary_scorer',
            isActive: true,
            canScore: true,
            user: {
              id: 'user-id',
              name: 'Rohit Sharma',
            },
          },
        ],
        message: 'Active scorers retrieved successfully',
      },
    },
  })
  async getActiveScorers(@Param('matchId') matchId: string) {
    const scorers = await this.scorerTransferService.getActiveScorers(matchId);

    return {
      success: true,
      statusCode: 200,
      data: scorers,
      message: 'Active scorers retrieved successfully',
    };
  }

  /**
   * Get pending transfer requests
   */
  @Get('pending-transfers')
  @ApiOperation({
    summary: 'Get pending transfer requests',
    description: `
    Get all pending scorer transfer requests for the current user.
    Shows who wants to transfer scoring to them and why.

    **UI Usage:**
    - Display notification badge with count
    - Show list of pending transfers
    - Allow accept/reject actions
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Pending transfers retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 'transfer-id',
            matchId: 'match-id',
            transferredFrom: 'virat-id',
            transferReason: 'Need to go bat in second innings',
            match: {
              id: 'match-id',
              teamA: 'India',
              teamB: 'Australia',
            },
            transferredFromUser: {
              id: 'virat-id',
              name: 'Virat Kohli',
            },
          },
        ],
        message: 'Pending transfers retrieved successfully',
      },
    },
  })
  async getPendingTransfers(@Request() req: any) {
    const transfers = await this.scorerTransferService.getPendingTransfers(
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: transfers,
      message: 'Pending transfers retrieved successfully',
    };
  }

  /**
   * Check if user can score
   */
  @Get('matches/:matchId/can-score')
  @ApiOperation({
    summary: 'Check if current user can score match',
    description: `
    Quick check to see if the current user has active scoring permissions.
    Useful for UI state management and button visibility.

    **UI Usage:**
    - Show/hide scoring buttons
    - Display current scorer status
    - Enable/disable scoring features
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Scoring permission checked',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          canScore: true,
          message: 'You have active scoring permissions for this match',
        },
        message: 'Scoring permission checked',
      },
    },
  })
  async canUserScore(@Param('matchId') matchId: string, @Request() req: any) {
    const canScore = await this.scorerTransferService.canUserScore(
      matchId,
      req.user.userId,
    );

    return {
      success: true,
      statusCode: 200,
      data: {
        canScore,
        message: canScore
          ? 'You have active scoring permissions for this match'
          : 'You do not have active scoring permissions for this match',
      },
      message: 'Scoring permission checked',
    };
  }

  /**
   * Get transfer history for a match
   */
  @Get('matches/:matchId/transfer-history')
  @ApiOperation({
    summary: 'Get transfer history for a match',
    description: `
    Get complete transfer history including all transfers, acceptances,
    rejections, and permission changes throughout the match.

    **Useful For:**
    - Match audit trail
    - Scoring accountability
    - Dispute resolution
    - Performance analysis
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Transfer history retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          totalTransfers: 5,
          pendingTransfers: 1,
          completedTransfers: 3,
          rejectedTransfers: 1,
          transfers: [
            {
              id: 'transfer-id',
              transferredFrom: 'virat-id',
              transferredTo: 'rohit-id',
              transferStatus: 'accepted',
              transferredAt: '2026-04-08T14:30:00.000Z',
              transferReason: 'Need to go bat',
            },
          ],
        },
        message: 'Transfer history retrieved successfully',
      },
    },
  })
  async getTransferHistory(@Param('matchId') matchId: string) {
    const history = await this.scorerTransferService.getTransferHistory(matchId);

    return {
      success: true,
      statusCode: 200,
      data: history,
      message: 'Transfer history retrieved successfully',
    };
  }
}
