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
exports.TeamAvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_service_1 = require("./match.service");
const team_availability_dto_1 = require("./dto/team-availability.dto");
let TeamAvailabilityController = class TeamAvailabilityController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    async postTeamAvailability(teamId, req, dto) {
        const availability = await this.matchService.postTeamAvailability(teamId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.CREATED,
            data: availability,
            message: 'Team availability posted successfully',
        };
    }
    async getAvailableTeams(date) {
        const teams = await this.matchService.getAvailableTeams(date);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: teams,
            message: 'Available teams retrieved successfully',
        };
    }
};
exports.TeamAvailabilityController = TeamAvailabilityController;
__decorate([
    (0, common_1.Post)('team/:teamId/availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Post team availability for matches' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Team availability posted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, team_availability_dto_1.TeamAvailabilityDto]),
    __metadata("design:returntype", Promise)
], TeamAvailabilityController.prototype, "postTeamAvailability", null);
__decorate([
    (0, common_1.Get)('team-availability/available'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all teams open for match requests on a date' }),
    (0, swagger_1.ApiQuery)({ name: 'date', description: 'Date to look up (YYYY-MM-DD)', example: '2024-03-25' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available teams retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamAvailabilityController.prototype, "getAvailableTeams", null);
exports.TeamAvailabilityController = TeamAvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('team-availability'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [match_service_1.MatchService])
], TeamAvailabilityController);
//# sourceMappingURL=team-availability.controller.js.map