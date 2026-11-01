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
exports.SuperOverController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const super_over_service_1 = require("./super-over.service");
const super_over_dto_1 = require("./dto/super-over.dto");
const swagger_1 = require("@nestjs/swagger");
let SuperOverController = class SuperOverController {
    constructor(superOverService) {
        this.superOverService = superOverService;
    }
    async startSuperOver(matchId, startSuperOverDto, req) {
        return await this.superOverService.startSuperOver(matchId, startSuperOverDto, req.user.userId);
    }
    async beginSuperOverInnings(superOverId, req) {
        return await this.superOverService.beginSuperOverInnings(superOverId, req.user.userId);
    }
    async deliverSuperOverBall(superOverId, superOverBallDto, req) {
        return await this.superOverService.deliverSuperOverBall(superOverId, superOverBallDto, req.user.userId);
    }
    async completeSuperOver(superOverId, completeSuperOverDto, req) {
        return await this.superOverService.completeSuperOver(superOverId, completeSuperOverDto, req.user.userId);
    }
    async abandonSuperOver(superOverId, abandonSuperOverDto, req) {
        return await this.superOverService.abandonSuperOver(superOverId, abandonSuperOverDto, req.user.userId);
    }
    async updateSuperOverStatus(superOverId, superOverStatusDto, req) {
        return await this.superOverService.updateSuperOverStatus(superOverId, superOverStatusDto, req.user.userId);
    }
    async getSuperOver(superOverId) {
        return await this.superOverService.getSuperOver(superOverId);
    }
    async getMatchSuperOvers(matchId) {
        return await this.superOverService.getMatchSuperOvers(matchId);
    }
};
exports.SuperOverController = SuperOverController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start a super over for a tied match' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Super over started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request - match must be tied' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, super_over_dto_1.StartSuperOverDto, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "startSuperOver", null);
__decorate([
    (0, common_1.Post)(':superOverId/begin'),
    (0, swagger_1.ApiOperation)({ summary: 'Begin super over innings after toss' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super over innings started' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Super over not in scheduled state' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "beginSuperOverInnings", null);
__decorate([
    (0, common_1.Post)(':superOverId/ball'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record a ball in super over',
        description: 'Records ball-by-ball action. If batting team loses 2 wickets, innings ends immediately. If 6 balls completed, innings ends.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ball recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, super_over_dto_1.SuperOverBallDto, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "deliverSuperOverBall", null);
__decorate([
    (0, common_1.Post)(':superOverId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete super over manually' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super over completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Super over not in progress' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, super_over_dto_1.CompleteSuperOverDto, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "completeSuperOver", null);
__decorate([
    (0, common_1.Post)(':superOverId/abandon'),
    (0, swagger_1.ApiOperation)({ summary: 'Abandon super over due to weather or other reasons' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super over abandoned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Super over not in valid state for abandonment' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, super_over_dto_1.AbandonSuperOverDto, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "abandonSuperOver", null);
__decorate([
    (0, common_1.Put)(':superOverId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update super over status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super over status updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, super_over_dto_1.SuperOverStatusDto, Object]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "updateSuperOverStatus", null);
__decorate([
    (0, common_1.Get)(':superOverId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get super over details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super over details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Super over not found' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    (0, swagger_1.ApiParam)({ name: 'superOverId', description: 'Super Over ID' }),
    __param(0, (0, common_1.Param)('superOverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "getSuperOver", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all super overs for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Super overs retrieved' }),
    (0, swagger_1.ApiParam)({ name: 'matchId', description: 'Match ID' }),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperOverController.prototype, "getMatchSuperOvers", null);
exports.SuperOverController = SuperOverController = __decorate([
    (0, swagger_1.ApiTags)('Super Over'),
    (0, common_1.Controller)('matches/:matchId/super-overs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [super_over_service_1.SuperOverService])
], SuperOverController);
//# sourceMappingURL=super-over.controller.js.map