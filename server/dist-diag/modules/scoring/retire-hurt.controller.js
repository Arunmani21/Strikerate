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
exports.RetireHurtController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const retire_hurt_service_1 = require("./retire-hurt.service");
const retire_hurt_dto_1 = require("./dto/retire-hurt.dto");
let RetireHurtController = class RetireHurtController {
    constructor(retireHurtService) {
        this.retireHurtService = retireHurtService;
    }
    async retireHurt(inningsId, req, dto) {
        const result = await this.retireHurtService.retireHurt(inningsId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Batsman retired hurt successfully',
        };
    }
    async returnFromRetirement(inningsId, req, dto) {
        const result = await this.retireHurtService.returnFromRetirement(inningsId, req.user.userId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Player returned from retirement successfully',
        };
    }
    async getRetiredHurtPlayers(inningsId) {
        const players = await this.retireHurtService.getRetiredHurtPlayers(inningsId);
        return {
            success: true,
            statusCode: 200,
            data: players,
            message: 'Retired hurt players retrieved successfully',
        };
    }
    async canPlayerReturn(inningsId, playerId) {
        const canReturn = await this.retireHurtService.canPlayerReturn(inningsId, playerId);
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
    async handleSubstituteFielder(matchId, dto) {
        const result = await this.retireHurtService.handleSubstituteFielder(matchId, dto);
        return {
            success: true,
            statusCode: 201,
            data: result,
            message: 'Substitute fielder recorded successfully',
        };
    }
    async getRetirementStats(matchId) {
        const stats = await this.retireHurtService.getRetirementStats(matchId);
        return {
            success: true,
            statusCode: 200,
            data: stats,
            message: 'Retirement statistics retrieved successfully',
        };
    }
};
exports.RetireHurtController = RetireHurtController;
__decorate([
    (0, common_1.Post)('innings/:inningsId/retire-hurt'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'inningsId',
        description: 'Innings ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Player already out or retired hurt' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings not found' }),
    __param(0, (0, common_1.Param)('inningsId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, retire_hurt_dto_1.RetireHurtDto]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "retireHurt", null);
__decorate([
    (0, common_1.Post)('innings/:inningsId/return-from-retirement'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'inningsId',
        description: 'Innings ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Player cannot return from retirement' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings or player not found' }),
    __param(0, (0, common_1.Param)('inningsId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, retire_hurt_dto_1.ReturnFromRetirementDto]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "returnFromRetirement", null);
__decorate([
    (0, common_1.Get)('innings/:inningsId/retired-hurt-players'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get retired hurt players',
        description: `
    Get all players who are currently retired hurt and haven't returned yet.
    Useful for deciding when to bring them back to bat.
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'inningsId',
        description: 'Innings ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('inningsId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "getRetiredHurtPlayers", null);
__decorate([
    (0, common_1.Get)('innings/:inningsId/can-return/:playerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if player can return',
        description: `
    Check if a specific player is eligible to return from retirement.
    Useful for captains and scorers to make decisions.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'inningsId', description: 'Innings ID' }),
    (0, swagger_1.ApiParam)({ name: 'playerId', description: 'Player ID' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('inningsId')),
    __param(1, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "canPlayerReturn", null);
__decorate([
    (0, common_1.Post)('matches/:matchId/substitute-fielder'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record substitute fielder (not implemented)',
        description: `
    Intended to record when a player needs a substitute fielder due to injury or other reasons.

    **Status:** Not implemented — substitutions are not persisted yet, so this
    endpoint always responds with 501 instead of recording fake state.
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'matchId',
        description: 'Match ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({ status: 501, description: 'Not implemented — substitutions are not persisted yet' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, retire_hurt_dto_1.SubstituteFielderDto]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "handleSubstituteFielder", null);
__decorate([
    (0, common_1.Get)('matches/:matchId/retirement-stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get retirement statistics',
        description: `
    Get comprehensive retirement statistics for a match.
    Useful for match reports and analysis.
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'matchId',
        description: 'Match ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RetireHurtController.prototype, "getRetirementStats", null);
exports.RetireHurtController = RetireHurtController = __decorate([
    (0, swagger_1.ApiTags)('Scoring - Retire Hurt'),
    (0, common_1.Controller)('scoring'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [retire_hurt_service_1.RetireHurtService])
], RetireHurtController);
//# sourceMappingURL=retire-hurt.controller.js.map