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
exports.GuestPlayerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const guest_player_service_1 = require("./guest-player.service");
const guest_player_dto_1 = require("./dto/guest-player.dto");
let GuestPlayerController = class GuestPlayerController {
    constructor(guestPlayerService) {
        this.guestPlayerService = guestPlayerService;
    }
    async addGuestPlayer(teamId, dto, req, matchId) {
        const guestPlayer = await this.guestPlayerService.addGuestPlayer(teamId, dto, req.user.userId, matchId);
        return {
            data: guestPlayer,
            message: 'Guest player added successfully',
        };
    }
    async getTeamGuestPlayers(teamId) {
        const guestPlayers = await this.guestPlayerService.getTeamGuestPlayers(teamId);
        return {
            data: guestPlayers,
            message: 'Guest players retrieved successfully',
        };
    }
    async getMatchGuestPlayers(matchId) {
        const guestPlayers = await this.guestPlayerService.getMatchGuestPlayers(matchId);
        return {
            data: guestPlayers,
            message: 'Match guest players retrieved successfully',
        };
    }
    async getGuestPlayer(id) {
        const guestPlayer = await this.guestPlayerService.getGuestPlayer(id);
        return {
            data: guestPlayer,
            message: 'Guest player retrieved successfully',
        };
    }
    async updateGuestPlayer(id, dto) {
        const guestPlayer = await this.guestPlayerService.updateGuestPlayer(id, dto);
        return {
            data: guestPlayer,
            message: 'Guest player updated successfully',
        };
    }
    async deactivateGuestPlayer(id) {
        await this.guestPlayerService.deactivateGuestPlayer(id);
        return {
            message: 'Guest player deactivated successfully',
        };
    }
    async convertGuestPlayer(id, dto) {
        const result = await this.guestPlayerService.convertGuestPlayer(id, dto);
        return {
            data: result,
            message: 'Guest player converted to regular player successfully',
        };
    }
    async canPlayInMatch(id, matchId) {
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
};
exports.GuestPlayerController = GuestPlayerController;
__decorate([
    (0, common_1.Post)('team/:teamId'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamId',
        description: 'Team ID to add guest player to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Guest player already exists' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guest_player_dto_1.CreateGuestPlayerDto, Object, String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "addGuestPlayer", null);
__decorate([
    (0, common_1.Get)('team/:teamId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get team guest players',
        description: 'Get all active guest players for a specific team',
    }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Guest players retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "getTeamGuestPlayers", null);
__decorate([
    (0, common_1.Get)('match/:matchId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get match guest players',
        description: 'Get all guest players added for a specific match',
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Match guest players retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "getMatchGuestPlayers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get guest player details',
        description: 'Get detailed information about a specific guest player',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Guest player ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Guest player retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Guest player not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "getGuestPlayer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update guest player',
        description: 'Update guest player information (name, contact, style, etc.)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Guest player ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Guest player updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update converted guest player' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Guest player not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guest_player_dto_1.UpdateGuestPlayerDto]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "updateGuestPlayer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate guest player',
        description: 'Deactivate a guest player (soft delete)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Guest player ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Guest player deactivated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Guest player not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "deactivateGuestPlayer", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Guest player ID to convert' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Guest player already converted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Guest player not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guest_player_dto_1.ConvertGuestPlayerDto]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "convertGuestPlayer", null);
__decorate([
    (0, common_1.Get)(':id/can-play/:matchId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if guest can play in match',
        description: 'Check if a guest player is eligible to play in a specific match',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Guest player ID' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Check completed',
        schema: {
            example: {
                success: true,
                data: { canPlay: true, reason: 'Guest player is active and eligible' },
                message: 'Guest player eligibility checked',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GuestPlayerController.prototype, "canPlayInMatch", null);
exports.GuestPlayerController = GuestPlayerController = __decorate([
    (0, swagger_1.ApiTags)('Guest Player Management'),
    (0, common_1.Controller)('guest-player'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [guest_player_service_1.GuestPlayerService])
], GuestPlayerController);
//# sourceMappingURL=guest-player.controller.js.map