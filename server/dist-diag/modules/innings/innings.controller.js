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
exports.InningsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const innings_service_1 = require("./innings.service");
const start_innings_dto_1 = require("./dto/start-innings.dto");
const set_batsmen_dto_1 = require("./dto/set-batsmen.dto");
const set_bowler_dto_1 = require("./dto/set-bowler.dto");
let InningsController = class InningsController {
    constructor(inningsService) {
        this.inningsService = inningsService;
    }
    async startInnings(matchId, req, dto) {
        const innings = await this.inningsService.startInnings(matchId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.CREATED,
            data: innings,
            message: 'Innings started successfully',
        };
    }
    async setBatsmen(inningsId, req, dto) {
        const innings = await this.inningsService.setBatsmen(inningsId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: innings,
            message: 'Batsmen set successfully',
        };
    }
    async setBowler(inningsId, req, dto) {
        const innings = await this.inningsService.setBowler(inningsId, req.user.userId, dto);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: innings,
            message: 'Bowler set successfully',
        };
    }
    async getInnings(inningsId) {
        const innings = await this.inningsService.getInnings(inningsId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: innings,
            message: 'Innings retrieved successfully',
        };
    }
    async getMatchInnings(matchId) {
        const innings = await this.inningsService.getMatchInnings(matchId);
        return {
            success: true,
            statusCode: common_1.HttpStatus.OK,
            data: innings,
            message: 'Innings retrieved successfully',
        };
    }
};
exports.InningsController = InningsController;
__decorate([
    (0, common_1.Post)('match/:matchId/start'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start an innings for a match' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Innings started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, start_innings_dto_1.StartInningsDto]),
    __metadata("design:returntype", Promise)
], InningsController.prototype, "startInnings", null);
__decorate([
    (0, common_1.Patch)(':id/set-batsmen'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set striker and non-striker batsmen' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batsmen set successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, set_batsmen_dto_1.SetBatsmenDto]),
    __metadata("design:returntype", Promise)
], InningsController.prototype, "setBatsmen", null);
__decorate([
    (0, common_1.Patch)(':id/set-bowler'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set current bowler' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bowler set successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, set_bowler_dto_1.SetBowlerDto]),
    __metadata("design:returntype", Promise)
], InningsController.prototype, "setBowler", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get innings by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Innings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Innings not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InningsController.prototype, "getInnings", null);
__decorate([
    (0, common_1.Get)('match/:matchId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all innings for a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Innings retrieved successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('matchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InningsController.prototype, "getMatchInnings", null);
exports.InningsController = InningsController = __decorate([
    (0, swagger_1.ApiTags)('innings'),
    (0, common_1.Controller)('innings'),
    __metadata("design:paramtypes", [innings_service_1.InningsService])
], InningsController);
//# sourceMappingURL=innings.controller.js.map