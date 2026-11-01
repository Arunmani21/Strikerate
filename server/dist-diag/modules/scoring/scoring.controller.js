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
exports.ScoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const scoring_service_1 = require("./scoring.service");
const ball_input_dto_1 = require("./dto/ball-input.dto");
let ScoringController = class ScoringController {
    constructor(scoringService) {
        this.scoringService = scoringService;
    }
    async deliverBall(req, dto) {
        const result = await this.scoringService.deliverBall(req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.CREATED,
            data: result,
            message: 'Ball recorded successfully',
        };
    }
    async getScorecard(matchId) {
        const scorecard = await this.scoringService.getScorecard(matchId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: scorecard,
            message: 'Scorecard retrieved successfully',
        };
    }
    async getOverSummary(inningsId) {
        const summary = await this.scoringService.getOverSummary(inningsId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: summary,
            message: 'Over summary retrieved successfully',
        };
    }
};
exports.ScoringController = ScoringController;
__decorate([
    (0, common_1.Post)('ball'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record a ball delivery' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ball recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings, match, or player not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ball_input_dto_1.BallInputDto]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "deliverBall", null);
__decorate([
    (0, common_1.Get)('scorecard/:matchId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed scorecard for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scorecard retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "getScorecard", null);
__decorate([
    (0, common_1.Get)('over-summary/:inningsId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get over-by-over summary for an innings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Over summary retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('inningsId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "getOverSummary", null);
exports.ScoringController = ScoringController = __decorate([
    (0, swagger_1.ApiTags)('scoring'),
    (0, common_1.Controller)('scoring'),
    __metadata("design:paramtypes", [scoring_service_1.ScoringService])
], ScoringController);
//# sourceMappingURL=scoring.controller.js.map