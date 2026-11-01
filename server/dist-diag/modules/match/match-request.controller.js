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
exports.MatchRequestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_service_1 = require("./match.service");
const match_request_dto_1 = require("./dto/match-request.dto");
let MatchRequestController = class MatchRequestController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    async getTeamMatchRequests(teamId, req) {
        const requests = await this.matchService.getTeamMatchRequests(teamId, req.user.userId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: requests,
            message: 'Match requests retrieved successfully',
        };
    }
    async respondToMatchRequest(requestId, req, dto) {
        const result = await this.matchService.respondToMatchRequest(requestId, req.user.userId, dto);
        if (dto.status === 'confirmed') {
            return {
                success: true,
                statusCode: common_1.HttpStatus.OK,
                data: result,
                message: 'Match confirmed successfully',
            };
        }
        else {
            return {
                success: true,
                statusCode: common_1.HttpStatus.OK,
                data: result,
                message: 'Match request rejected',
            };
        }
    }
};
exports.MatchRequestController = MatchRequestController;
__decorate([
    (0, common_1.Get)('team/:teamId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List match requests for a team (sent and received)',
        description: 'Returns all match requests where the team is the requesting team or the opponent, newest first. Only team members can view.',
    }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match requests retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Caller is not a member of the team' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchRequestController.prototype, "getTeamMatchRequests", null);
__decorate([
    (0, common_1.Patch)(':id/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Respond to a match request (confirm/reject)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match request responded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, match_request_dto_1.RespondRequestDto]),
    __metadata("design:returntype", Promise)
], MatchRequestController.prototype, "respondToMatchRequest", null);
exports.MatchRequestController = MatchRequestController = __decorate([
    (0, swagger_1.ApiTags)('match-requests'),
    (0, common_1.Controller)('match-request'),
    __metadata("design:paramtypes", [match_service_1.MatchService])
], MatchRequestController);
//# sourceMappingURL=match-request.controller.js.map