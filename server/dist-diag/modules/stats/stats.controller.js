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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const stats_service_1 = require("./stats.service");
let StatsController = class StatsController {
    constructor(statsService) {
        this.statsService = statsService;
    }
    async calculateMatchPerformance(matchId, req) {
        const result = await this.statsService.calculateMatchPerformance(matchId, req.user.userId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: result,
            message: 'Statistics calculated successfully',
        };
    }
    async setPlayerOfMatch(matchId, playerId, req) {
        const result = await this.statsService.setPlayerOfMatch(matchId, playerId, req.user.userId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: result,
            message: 'Player of match updated successfully',
        };
    }
    async getPlayerCareerStats(playerId) {
        const stats = await this.statsService.getPlayerCareerStats(playerId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: stats,
            message: 'Career stats retrieved successfully',
        };
    }
    async getPlayerMatchHistory(playerId) {
        const performances = await this.statsService.getPlayerMatchHistory(playerId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: performances,
            message: 'Match history retrieved successfully',
        };
    }
    async getMatchPerformances(matchId) {
        const performances = await this.statsService.getMatchPerformances(matchId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: performances,
            message: 'Match performances retrieved successfully',
        };
    }
    async getTeamHistory(teamId) {
        const history = await this.statsService.getTeamHistory(teamId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: history,
            message: 'Team history retrieved successfully',
        };
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Patch)('match/:matchId/calculate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate statistics for a completed match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics calculated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Match must be completed first' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "calculateMatchPerformance", null);
__decorate([
    (0, common_1.Patch)('match/:matchId/player-of-match/:playerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set player of the match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Player of match updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Performance not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Param)('playerId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "setPlayerOfMatch", null);
__decorate([
    (0, common_1.Get)('player/:playerId/career'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get career statistics for a player' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Career stats retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Career stats not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getPlayerCareerStats", null);
__decorate([
    (0, common_1.Get)('player/:playerId/matches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get match history for a player' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match history retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getPlayerMatchHistory", null);
__decorate([
    (0, common_1.Get)('match/:matchId/performances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all player performances for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match performances retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getMatchPerformances", null);
__decorate([
    (0, common_1.Get)('team/:teamId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get match history for a team' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team history retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getTeamHistory", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('stats'),
    (0, common_1.Controller)('stats'),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map