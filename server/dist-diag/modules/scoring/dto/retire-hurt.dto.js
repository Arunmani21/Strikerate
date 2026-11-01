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
exports.SubstituteFielderDto = exports.ReturnFromRetirementDto = exports.RetireHurtDto = exports.RetirementReason = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RetirementReason;
(function (RetirementReason) {
    RetirementReason["INJURY"] = "injury";
    RetirementReason["ILLNESS"] = "illness";
    RetirementReason["EMERGENCY"] = "emergency";
    RetirementReason["OTHER"] = "other";
})(RetirementReason || (exports.RetirementReason = RetirementReason = {}));
class RetireHurtDto {
}
exports.RetireHurtDto = RetireHurtDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Player ID who is retiring hurt',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RetireHurtDto.prototype, "playerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for retirement',
        example: 'injury',
        enum: RetirementReason,
    }),
    (0, class_validator_1.IsEnum)(RetirementReason),
    __metadata("design:type", String)
], RetireHurtDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed description of the injury/issue',
        example: 'Pulled hamstring while running a quick single',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RetireHurtDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the player is expected to return later',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RetireHurtDto.prototype, "expectedToReturn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated time of return (in minutes)',
        example: 30,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RetireHurtDto.prototype, "estimatedReturnTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Deprecated: ignored by the server, which derives the ball number from innings state',
        example: '45.3',
        deprecated: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RetireHurtDto.prototype, "currentBallNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes',
        example: 'Team physio attending to player',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RetireHurtDto.prototype, "notes", void 0);
class ReturnFromRetirementDto {
}
exports.ReturnFromRetirementDto = ReturnFromRetirementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Player ID who is returning from retirement',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReturnFromRetirementDto.prototype, "playerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Deprecated: ignored by the server, which derives the ball number from innings state',
        example: '67.3',
        deprecated: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnFromRetirementDto.prototype, "ballNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether player is fully fit',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReturnFromRetirementDto.prototype, "fullyFit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes about return',
        example: 'Player has recovered and is ready to bat',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnFromRetirementDto.prototype, "notes", void 0);
class SubstituteFielderDto {
}
exports.SubstituteFielderDto = SubstituteFielderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Player ID who needs substitute',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubstituteFielderDto.prototype, "playerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Substitute fielder ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubstituteFielderDto.prototype, "substitutePlayerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for substitution',
        example: 'injury',
        enum: RetirementReason,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RetirementReason),
    __metadata("design:type", String)
], SubstituteFielderDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expected time away from field (in minutes)',
        example: 15,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SubstituteFielderDto.prototype, "expectedTimeAway", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes',
        example: 'Going for treatment, will return soon',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubstituteFielderDto.prototype, "notes", void 0);
//# sourceMappingURL=retire-hurt.dto.js.map