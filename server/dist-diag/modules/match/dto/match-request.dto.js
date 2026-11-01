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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespondRequestDto = exports.MatchRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class MatchRequestDto {
}
exports.MatchRequestDto = MatchRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opponent team ID to send request to',
        example: '550e8400-e29b-41d4-a716-446655440001',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid opponent team ID format' }),
    __metadata("design:type", String)
], MatchRequestDto.prototype, "opponentTeamId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred match date (YYYY-MM-DD format)',
        example: '2024-03-25',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid date in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], MatchRequestDto.prototype, "matchDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred match time (HH:MM format)',
        example: '14:30',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MatchRequestDto.prototype, "matchTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred venue',
        example: 'Mumbai Cricket Ground',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200, { message: 'Venue must not exceed 200 characters' }),
    __metadata("design:type", String)
], MatchRequestDto.prototype, "venue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred match format (overs)',
        example: 20,
        minimum: 5,
        maximum: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Preferred overs must be an integer' }),
    (0, class_validator_1.Min)(5, { message: 'Minimum 5 overs' }),
    (0, class_validator_1.Max)(50, { message: 'Maximum 50 overs' }),
    __metadata("design:type", Number)
], MatchRequestDto.prototype, "preferredOvers", void 0);
class RespondRequestDto {
}
exports.RespondRequestDto = RespondRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response to match request',
        enum: ['confirmed', 'rejected'],
        example: 'confirmed',
    }),
    (0, class_validator_1.IsIn)(['confirmed', 'rejected'], {
        message: 'Status must be either confirmed or rejected',
    }),
    __metadata("design:type", String)
], RespondRequestDto.prototype, "status", void 0);
//# sourceMappingURL=match-request.dto.js.map