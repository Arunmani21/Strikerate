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
exports.CreatePlayerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePlayerDto {
}
exports.CreatePlayerDto = CreatePlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Player full name',
        example: 'Virat Kohli',
        minLength: 2,
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'Player name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Player name must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jersey number (optional)',
        example: 18,
        minimum: 0,
        maximum: 999,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Jersey number must be an integer' }),
    (0, class_validator_1.Min)(0, { message: 'Jersey number cannot be negative' }),
    (0, class_validator_1.Max)(999, { message: 'Jersey number cannot exceed 999' }),
    __metadata("design:type", Number)
], CreatePlayerDto.prototype, "jerseyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Link to existing user account (optional)',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid user ID format' }),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "userId", void 0);
//# sourceMappingURL=create-player.dto.js.map