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
exports.TossController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const match_service_1 = require("./match.service");
const toss_dto_1 = require("./dto/toss.dto");
let TossController = class TossController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    async recordToss(matchId, req, dto) {
        const match = await this.matchService.recordToss(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: match,
            message: 'Toss recorded successfully',
        };
    }
};
exports.TossController = TossController;
__decorate([
    (0, common_1.Patch)(':matchId/toss'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record toss for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Toss recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, toss_dto_1.TossDto]),
    __metadata("design:returntype", Promise)
], TossController.prototype, "recordToss", null);
exports.TossController = TossController = __decorate([
    (0, swagger_1.ApiTags)('toss'),
    (0, common_1.Controller)('matches'),
    __metadata("design:paramtypes", [match_service_1.MatchService])
], TossController);
//# sourceMappingURL=toss.controller.js.map