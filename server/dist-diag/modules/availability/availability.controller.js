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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const player_service_1 = require("../player/player.service");
const player_availability_dto_1 = require("../player/dto/player-availability.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AvailabilityController = class AvailabilityController {
    constructor(playerService) {
        this.playerService = playerService;
    }
    async setPlayerAvailability(req, dto) {
        const result = await this.playerService.setPlayerAvailability(req.user.userId, dto);
        return {
            data: result,
            message: 'Player availability updated successfully',
        };
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Patch)('availability'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set player availability',
        description: `
    Set or update player availability for a specific date.

    **Requirements:**
    - Can set own availability
    - Captain/manager can set team player availability

    **Parameters:**
    - playerId: Player to update
    - availableDate: Date (YYYY-MM-DD format)
    - isAvailable: Available status (true/false)
    - reason: Optional reason for unavailability
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability updated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    message: 'Player availability updated successfully',
                },
                message: 'Player availability updated successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - invalid permission or data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Player not found',
    }),
    (0, swagger_1.ApiBody)({ type: player_availability_dto_1.UpdatePlayerAvailabilityDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, player_availability_dto_1.UpdatePlayerAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "setPlayerAvailability", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Player Availability'),
    (0, common_1.Controller)('player'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [player_service_1.PlayerService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map