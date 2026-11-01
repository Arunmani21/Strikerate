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
exports.MatchStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_status_service_1 = require("./match-status.service");
const match_entity_1 = require("./match.entity");
const match_status_dto_1 = require("./dto/match-status.dto");
let MatchStatusController = class MatchStatusController {
    constructor(matchStatusService) {
        this.matchStatusService = matchStatusService;
    }
    async abandonMatch(matchId, req, dto) {
        const result = await this.matchStatusService.abandonMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match abandoned successfully',
        };
    }
    async completeMatch(matchId, req, dto) {
        const result = await this.matchStatusService.completeMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match completed successfully',
        };
    }
    async declareMatchTied(matchId, req, dto) {
        const result = await this.matchStatusService.declareMatchTied(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match declared as tied successfully',
        };
    }
    async declareMatchDraw(matchId, req, dto) {
        const result = await this.matchStatusService.declareMatchDraw(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match declared as drawn successfully',
        };
    }
    async delayMatch(matchId, req, dto) {
        const result = await this.matchStatusService.delayMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match delayed successfully',
        };
    }
    async resumeMatch(matchId, req, dto) {
        const result = await this.matchStatusService.resumeMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match resumed successfully',
        };
    }
    async postponeMatch(matchId, req, dto) {
        const result = await this.matchStatusService.postponeMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match postponed successfully',
        };
    }
    async cancelMatch(matchId, req, dto) {
        const result = await this.matchStatusService.cancelMatch(matchId, dto, req.user.userId);
        return {
            success: true,
            statusCode: 200,
            data: result,
            message: 'Match cancelled successfully',
        };
    }
    async getLiveMatches() {
        const matches = await this.matchStatusService.getLiveMatches();
        return {
            success: true,
            statusCode: 200,
            data: matches,
            message: 'Live matches retrieved successfully',
        };
    }
    async getUpcomingMatches() {
        const matches = await this.matchStatusService.getUpcomingMatches();
        return {
            success: true,
            statusCode: 200,
            data: matches,
            message: 'Upcoming matches retrieved successfully',
        };
    }
    async getCompletedMatches() {
        const matches = await this.matchStatusService.getCompletedMatches();
        return {
            success: true,
            statusCode: 200,
            data: matches,
            message: 'Completed matches retrieved successfully',
        };
    }
    async getMatchesByStatus(status) {
        const matches = await this.matchStatusService.getMatchesByStatus(status);
        return {
            success: true,
            statusCode: 200,
            data: matches,
            message: 'Matches retrieved successfully',
        };
    }
};
exports.MatchStatusController = MatchStatusController;
__decorate([
    (0, common_1.Post)(':matchId/abandon'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.AbandonMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "abandonMatch", null);
__decorate([
    (0, common_1.Post)(':matchId/complete'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.CompleteMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "completeMatch", null);
__decorate([
    (0, common_1.Post)(':matchId/tie'),
    (0, swagger_1.ApiOperation)({
        summary: 'Declare match as tied (Manual)',
        description: `
    **MANUAL STATUS UPDATE** 🤝

    Manually declare a match as tied.
    Use when automatic tie detection doesn't apply.

    **Note:** Ties are usually detected automatically by scoring system.
    This is for manual override only.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.DeclareMatchTiedDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "declareMatchTied", null);
__decorate([
    (0, common_1.Post)(':matchId/draw'),
    (0, swagger_1.ApiOperation)({
        summary: 'Declare match as drawn (Manual)',
        description: `
    **MANUAL STATUS UPDATE** 🎨

    Manually declare a match as drawn (mainly for Test matches).
    Use when automatic draw detection doesn't apply.

    **Note:** Draws are usually detected automatically by scoring system.
    This is for manual override only.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.DeclareMatchDrawDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "declareMatchDraw", null);
__decorate([
    (0, common_1.Post)(':matchId/delay'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.DelayMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "delayMatch", null);
__decorate([
    (0, common_1.Post)(':matchId/resume'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.ResumeMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "resumeMatch", null);
__decorate([
    (0, common_1.Post)(':matchId/postpone'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.PostponeMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "postponeMatch", null);
__decorate([
    (0, common_1.Post)(':matchId/cancel'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_status_dto_1.CancelMatchDto]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "cancelMatch", null);
__decorate([
    (0, common_1.Get)('status/live'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all live matches',
        description: 'Get all matches currently in progress (LIVE status).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Live matches retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "getLiveMatches", null);
__decorate([
    (0, common_1.Get)('status/upcoming'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get upcoming scheduled matches',
        description: 'Get all scheduled matches that are yet to start.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Upcoming matches retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "getUpcomingMatches", null);
__decorate([
    (0, common_1.Get)('status/completed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get completed matches',
        description: 'Get all matches that have finished with a result.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Completed matches retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "getCompletedMatches", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get matches by status',
        description: 'Get all matches with a specific status.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'status',
        description: 'Match status to filter by',
        enum: match_entity_1.MatchStatus,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Matches retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchStatusController.prototype, "getMatchesByStatus", null);
exports.MatchStatusController = MatchStatusController = __decorate([
    (0, swagger_1.ApiTags)('Match Status Management'),
    (0, common_1.Controller)('matches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [match_status_service_1.MatchStatusService])
], MatchStatusController);
//# sourceMappingURL=match-status.controller.js.map