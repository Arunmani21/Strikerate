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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const user_profile_entity_1 = require("../../user/user-profile.entity");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User full name',
        example: 'John Doe',
        minLength: 2,
        maxLength: 50,
        pattern: '^[a-zA-Z\\s]+$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Name must not exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s]+$/, {
        message: 'Name must contain only letters and spaces',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email',
        maxLength: 100,
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Email must not exceed 100 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password (min 8 chars, must contain uppercase, lowercase, and number)',
        example: 'SecurePass123',
        minLength: 8,
        maxLength: 50,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Password must not exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary cricket role',
        enum: user_profile_entity_1.UserRole,
        example: 'allrounder',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.UserRole, { message: 'Invalid role selected' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Batting style',
        enum: user_profile_entity_1.BattingStyle,
        example: 'right_hand',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.BattingStyle, { message: 'Invalid batting style selected' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "battingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bowling style',
        enum: user_profile_entity_1.BowlingStyle,
        example: 'right_arm_fast',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_profile_entity_1.BowlingStyle, { message: 'Invalid bowling style selected' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "bowlingStyle", void 0);
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
], RegisterDto.prototype, "experienceYears", void 0);
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
], RegisterDto.prototype, "bio", void 0);
//# sourceMappingURL=register.dto.js.map