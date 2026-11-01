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
exports.TeamMatchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_service_1 = require("./match.service");
const match_request_dto_1 = require("./dto/match-request.dto");
let TeamMatchesController = class TeamMatchesController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    async sendMatchRequest(teamId, req, dto) {
        const matchRequest = await this.matchService.sendMatchRequest(teamId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.CREATED,
            data: matchRequest,
            message: 'Match request sent successfully',
        };
    }
    async getUpcomingMatches(teamId) {
        const matches = await this.matchService.getUpcomingMatches(teamId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: matches,
            message: 'Upcoming matches retrieved successfully',
        };
    }
};
exports.TeamMatchesController = TeamMatchesController;
__decorate([
    (0, common_1.Post)(':teamId/match-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send match request to another team' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Match request sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict - pending request already exists' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_request_dto_1.MatchRequestDto]),
    __metadata("design:returntype", Promise)
], TeamMatchesController.prototype, "sendMatchRequest", null);
__decorate([
    (0, common_1.Get)(':teamId/matches/upcoming'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming matches for a team' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upcoming matches retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamMatchesController.prototype, "getUpcomingMatches", null);
exports.TeamMatchesController = TeamMatchesController = __decorate([
    (0, swagger_1.ApiTags)('team-matches'),
    (0, common_1.Controller)('team'),
    __metadata("design:paramtypes", [match_service_1.MatchService])
], TeamMatchesController);
//# sourceMappingURL=team-matches.controller.js.map