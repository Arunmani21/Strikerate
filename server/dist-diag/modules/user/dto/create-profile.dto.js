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
exports.CreateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const user_profile_entity_1 = require("../user-profile.entity");
const swagger_1 = require("@nestjs/swagger");
class CreateProfileDto {
}
exports.CreateProfileDto = CreateProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary cricket role',
        enum: user_profile_entity_1.UserRole,
        example: 'allrounder',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.UserRole, { message: 'Invalid role selected' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Batting style',
        enum: user_profile_entity_1.BattingStyle,
        example: 'right_hand',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.BattingStyle, { message: 'Invalid batting style selected' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "battingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bowling style',
        enum: user_profile_entity_1.BowlingStyle,
        example: 'right_arm_fast',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.BowlingStyle, { message: 'Invalid bowling style selected' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "bowlingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Years of cricket experience',
        example: 5,
        minimum: 0,
        maximum: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Experience years must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Experience years cannot be negative' }),
    (0, class_validator_1.Max)(50, { message: 'Experience years cannot exceed 50' }),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "experienceYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Short biography or description',
        example: 'Experienced all-rounder player',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Bio must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "bio", void 0);
//# sourceMappingURL=create-profile.dto.js.map