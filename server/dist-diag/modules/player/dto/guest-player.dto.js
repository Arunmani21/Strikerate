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
exports.ConvertGuestPlayerDto = exports.UpdateGuestPlayerDto = exports.CreateGuestPlayerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateGuestPlayerDto {
}
exports.CreateGuestPlayerDto = CreateGuestPlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Rahul Sharma', description: 'Guest player name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Name must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210', description: 'Mobile number (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsPhoneNumber)(null, { message: 'Please provide a valid mobile number' }),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'rahul.guest@example.com', description: 'Email address (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'right_hand',
        description: 'Batting style',
        enum: ['right_hand', 'left_hand'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "battingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'right_arm_fast',
        description: 'Bowling style',
        enum: ['right_arm_fast', 'left_arm_fast', 'right_arm_spin', 'left_arm_spin'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "bowlingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'allrounder',
        description: 'Player role',
        enum: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['batsman', 'bowler', 'allrounder', 'wicketkeeper'], {
        message: 'Role must be one of: batsman, bowler, allrounder, wicketkeeper',
    }),
    __metadata("design:type", String)
], CreateGuestPlayerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { notes: 'Friend of regular player', temporary: true },
        description: 'Additional metadata',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateGuestPlayerDto.prototype, "metadata", void 0);
class UpdateGuestPlayerDto {
}
exports.UpdateGuestPlayerDto = UpdateGuestPlayerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Rahul Kumar Sharma', description: 'Updated name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543211' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsPhoneNumber)(null),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'rahul.updated@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "battingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "bowlingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['batsman', 'bowler', 'allrounder', 'wicketkeeper']),
    __metadata("design:type", String)
], UpdateGuestPlayerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateGuestPlayerDto.prototype, "metadata", void 0);
class ConvertGuestPlayerDto {
}
exports.ConvertGuestPlayerDto = ConvertGuestPlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@email.com',
        description: 'Email to use for the new regular player account',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ConvertGuestPlayerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SecurePassword123',
        description: 'Password for the new account',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    __metadata("design:type", String)
], ConvertGuestPlayerDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+919876543210',
        description: 'Mobile number (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsPhoneNumber)(null),
    __metadata("design:type", String)
], ConvertGuestPlayerDto.prototype, "mobile", void 0);
//# sourceMappingURL=guest-player.dto.js.map