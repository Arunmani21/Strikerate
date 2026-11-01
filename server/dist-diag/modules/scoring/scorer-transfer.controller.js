"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScorerTransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const scorer_transfer_service_1 = require("./scorer-transfer.service");
const scorer_transfer_dto_1 = require("./dto/scorer-transfer.dto");
let ScorerTransferController = class ScorerTransferController {
    constructor(scorerTransferService) {
        this.scorerTransferService = scorerTransferService;
    }
    async transferScorer(matchId, req, dto) {
        const result = await this.scorerTransferService.transferScorer(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Scorer transfer initiated successfully',
        };
    }
    async acceptScorerTransfer(req, dto) {
        const result = await this.scorerTransferService.acceptScorerTransfer(dto.transferRequestId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Scorer transfer accepted successfully',
        };
    }
    async rejectScorerTransfer(req, dto) {
        const result = await this.scorerTransferService.rejectScorerTransfer(dto.transferRequestId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Scorer transfer rejected successfully',
        };
    }
    async revokeScorerAccess(matchId, req, dto) {
        const result = await this.scorerTransferService.revokeScorerAccess(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Scoring access revoked successfully',
        };
    }
    async grantScorerAccess(matchId, req, dto) {
        const result = await this.scorerTransferService.grantScorerAccess(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Scoring access granted successfully',
        };
    }
    async updateScorerRole(matchId, req, dto) {
        const result = await this.scorerTransferService.updateScorerRole(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Scorer role updated successfully',
        };
    }
    async getMatchScorers(matchId) {
        const scorers = await this.scorerTransferService.getMatchScorers(matchId);
        return {
            success: true,
            statusCode: 200,
            data: scorers,
            message: 'Scorers retrieved successfully',
        };
    }
    async getActiveScorers(matchId) {
        const scorers = await this.scorerTransferService.getActiveScorers(matchId);
        return {
            success: true,
            statusCode: 200,
            data: scorers,
            message: 'Active scorers retrieved successfully',
        };
    }
    async getPendingTransfers(req) {
        const transfers = await this.scorerTransferService.getPendingTransfers(req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: transfers,
            message: 'Pending transfers retrieved successfully',
        };
    }
    async canUserScore(matchId, req) {
        const canScore = await this.scorerTransferService.canUserScore(matchId, req.user.userId);
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
    async getTransferHistory(matchId) {
        const history = await this.scorerTransferService.getTransferHistory(matchId);
        return {
            success: true,
            statusCode: 200,
            data: history,
            message: 'Transfer history retrieved successfully',
        };
    }
};
exports.ScorerTransferController = ScorerTransferController;
__decorate([
    (0, common_1.Post)('matches/:matchId/transfer-scorer'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'matchId',
        description: 'Match ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'You do not have scoring permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match or user not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scorer_transfer_dto_1.TransferScorerDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "transferScorer", null);
__decorate([
    (0, common_1.Post)('accept-scorer-transfer'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transfer cannot be accepted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transfer request not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scorer_transfer_dto_1.AcceptScorerTransferDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "acceptScorerTransfer", null);
__decorate([
    (0, common_1.Post)('reject-scorer-transfer'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scorer_transfer_dto_1.RejectScorerTransferDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "rejectScorerTransfer", null);
__decorate([
    (0, common_1.Put)('matches/:matchId/revoke-scorer-access'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scorer_transfer_dto_1.RevokeScorerAccessDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "revokeScorerAccess", null);
__decorate([
    (0, common_1.Post)('matches/:matchId/grant-scorer-access'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scorer_transfer_dto_1.GrantScorerAccessDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "grantScorerAccess", null);
__decorate([
    (0, common_1.Put)('matches/:matchId/update-scorer-role'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scorer_transfer_dto_1.UpdateScorerRoleDto]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "updateScorerRole", null);
__decorate([
    (0, common_1.Get)('matches/:matchId/scorers'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "getMatchScorers", null);
__decorate([
    (0, common_1.Get)('matches/:matchId/active-scorers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active scorers for a match',
        description: `
    Get currently active scorers who can score the match.
    Useful for displaying current scoring team in the UI.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "getActiveScorers", null);
__decorate([
    (0, common_1.Get)('pending-transfers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending transfer requests',
        description: `
    Get all pending scorer transfer requests for the current user.
    Shows who wants to transfer scoring to them and why.

    **UI Usage:**
    - Display notification badge with count
    - Show list of pending transfers
    - Allow accept/reject actions
    `,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "getPendingTransfers", null);
__decorate([
    (0, common_1.Get)('matches/:matchId/can-score'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if current user can score match',
        description: `
    Quick check to see if the current user has active scoring permissions.
    Useful for UI state management and button visibility.

    **UI Usage:**
    - Show/hide scoring buttons
    - Display current scorer status
    - Enable/disable scoring features
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "canUserScore", null);
__decorate([
    (0, common_1.Get)('matches/:matchId/transfer-history'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScorerTransferController.prototype, "getTransferHistory", null);
exports.ScorerTransferController = ScorerTransferController = __decorate([
    (0, swagger_1.ApiTags)('Scoring - Scorer Transfer'),
    (0, common_1.Controller)('scoring'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [scorer_transfer_service_1.ScorerTransferService])
], ScorerTransferController);
//# sourceMappingURL=scorer-transfer.controller.js.map