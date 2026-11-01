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
exports.Playing11Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const playing11_service_1 = require("./playing11.service");
const select_playing11_dto_1 = require("./dto/select-playing11.dto");
let Playing11Controller = class Playing11Controller {
    constructor(playing11Service) {
        this.playing11Service = playing11Service;
    }
    async selectPlaying11(matchId, teamId, req, dto) {
        const result = await this.playing11Service.selectPlaying11(matchId, teamId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.CREATED,
            data: result,
            message: 'Playing 11 selected successfully',
        };
    }
    async getPlaying11Status(matchId) {
        const status = await this.playing11Service.getPlaying11Status(matchId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: status,
            message: 'Playing 11 status retrieved successfully',
        };
    }
    async getPlaying11(matchId, teamId) {
        const playing11 = await this.playing11Service.getPlaying11(matchId, teamId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: playing11,
            message: 'Playing 11 retrieved successfully',
        };
    }
};
exports.Playing11Controller = Playing11Controller;
__decorate([
    (0, common_1.Post)(':matchId/playing11/:teamId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Select playing 11 for a match',
        description: `
    Select the playing 11 for a match with support for guest players.

    **Important Notes:**
    - Total must be exactly 11 players (regular + guest combined)
    - Guest players don't need app registration
    - Perfect for last-minute substitutions or temporary players
    - Regular players must be available (checked against availability)
    - Guest players must be active and belong to the team

    **Example Request Body:**
    {
      "playerIds": ["regular-player-1", "regular-player-2", ...],
      "guestPlayerIds": ["guest-player-1", "guest-player-2"]
    }

    The total count of playerIds + guestPlayerIds must equal 11.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Playing 11 selected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match or players not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Param)('teamId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, select_playing11_dto_1.SelectPlaying11Dto]),
    __metadata("design:returntype", Promise)
], Playing11Controller.prototype, "selectPlaying11", null);
__decorate([
    (0, common_1.Get)(':matchId/playing11/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get playing 11 selection status for a match' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Playing11Controller.prototype, "getPlaying11Status", null);
__decorate([
    (0, common_1.Get)(':matchId/playing11/:teamId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get playing 11 for a specific team in a match' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Playing 11 retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playing 11 not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], Playing11Controller.prototype, "getPlaying11", null);
exports.Playing11Controller = Playing11Controller = __decorate([
    (0, swagger_1.ApiTags)('playing11'),
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [playing11_service_1.Playing11Service])
], Playing11Controller);
//# sourceMappingURL=playing11.controller.js.map