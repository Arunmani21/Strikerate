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
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const player_service_1 = require("./player.service");
const create_player_dto_1 = require("./dto/create-player.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const team_permission_guard_1 = require("../team/team-permission.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const team_roles_1 = require("../team/team-roles");
let PlayerController = class PlayerController {
    constructor(playerService) {
        this.playerService = playerService;
    }
    async addPlayer(teamId, dto) {
        const player = await this.playerService.addPlayer(teamId, dto);
        return {
            data: player,
            message: 'Player added successfully',
        };
    }
    async removePlayer(teamId, playerId) {
        const result = await this.playerService.removePlayer(teamId, playerId);
        return {
            data: result,
            message: 'Player removed successfully',
        };
    }
    async getTeamPlayers(teamId) {
        const players = await this.playerService.getTeamPlayers(teamId);
        return {
            data: players,
            message: 'Players retrieved successfully',
        };
    }
    async getAvailablePlayers(teamId, date) {
        const players = await this.playerService.getAvailablePlayers(teamId, date);
        return {
            data: players,
            message: 'Available players retrieved successfully',
        };
    }
};
exports.PlayerController = PlayerController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(team_permission_guard_1.TeamPermissionGuard),
    (0, roles_decorator_1.Roles)(team_roles_1.TeamRole.CAPTAIN),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamId',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Player name already exists in team',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Not captain or manager',
    }),
    (0, swagger_1.ApiBody)({ type: create_player_dto_1.CreatePlayerDto }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_player_dto_1.CreatePlayerDto]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "addPlayer", null);
__decorate([
    (0, common_1.Delete)(':playerId'),
    (0, common_1.UseGuards)(team_permission_guard_1.TeamPermissionGuard),
    (0, roles_decorator_1.Roles)(team_roles_1.TeamRole.CAPTAIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove player from team',
        description: `
    Remove a player from the team.

    **Requirements:**
    - Must be captain or manager of the team
    - Player must not be in any live match

    **Note:** Cannot remove players during live matches
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamId',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'playerId',
        description: 'Player ID to remove',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Player not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Not captain or manager',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot remove player during live match',
    }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "removePlayer", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all team players',
        description: `
    Get all players in the team.

    **Returns:**
    - Complete player list with statistics
    - Ordered alphabetically by name
    - Includes both batting and bowling stats
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamId',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getTeamPlayers", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamId',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        description: 'Date to check availability (YYYY-MM-DD format)',
        example: '2024-03-20',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid date format',
    }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getAvailablePlayers", null);
exports.PlayerController = PlayerController = __decorate([
    (0, swagger_1.ApiTags)('Players'),
    (0, common_1.Controller)('team/:teamId/player'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [player_service_1.PlayerService])
], PlayerController);
//# sourceMappingURL=player.controller.js.map