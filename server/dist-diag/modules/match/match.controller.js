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
exports.MatchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_service_1 = require("./match.service");
let MatchController = class MatchController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    async getLiveMatches() {
        const matches = await this.matchService.getLiveMatches();
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: matches,
            message: 'Live matches retrieved successfully',
        };
    }
    async getMatch(matchId) {
        const match = await this.matchService.getMatch(matchId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: match,
            message: 'Match retrieved successfully',
        };
    }
};
exports.MatchController = MatchController;
__decorate([
    (0, common_1.Get)('live'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all live matches' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Live matches retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "getLiveMatches", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get match by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "getMatch", null);
exports.MatchController = MatchController = __decorate([
    (0, swagger_1.ApiTags)('matches'),
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [match_service_1.MatchService])
], MatchController);
//# sourceMappingURL=match.controller.js.map