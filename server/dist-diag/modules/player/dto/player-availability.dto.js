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
exports.UpdatePlayerAvailabilityDto = exports.PlayerAvailabilityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PlayerAvailabilityDto {
}
exports.PlayerAvailabilityDto = PlayerAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date for availability (YYYY-MM-DD format)',
        example: '2024-03-20',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid date in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], PlayerAvailabilityDto.prototype, "availableDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the player is available on this date',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isAvailable must be a boolean value' }),
    __metadata("design:type", Boolean)
], PlayerAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for unavailability (if not available)',
        example: 'Injured - knee injury',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], PlayerAvailabilityDto.prototype, "reason", void 0);
class UpdatePlayerAvailabilityDto {
}
exports.UpdatePlayerAvailabilityDto = UpdatePlayerAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Player ID to update availability for',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid player ID format' }),
    __metadata("design:type", String)
], UpdatePlayerAvailabilityDto.prototype, "playerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date for availability (YYYY-MM-DD format)',
        example: '2024-03-20',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid date in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], UpdatePlayerAvailabilityDto.prototype, "availableDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the player is available on this date',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isAvailable must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdatePlayerAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for unavailability (if not available)',
        example: 'Family commitment',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], UpdatePlayerAvailabilityDto.prototype, "reason", void 0);
//# sourceMappingURL=player-availability.dto.js.map