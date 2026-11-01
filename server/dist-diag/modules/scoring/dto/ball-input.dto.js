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
exports.BallInputDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const ball_entity_1 = require("../ball.entity");
class BallInputDto {
}
exports.BallInputDto = BallInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Innings ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid innings ID format' }),
    __metadata("design:type", String)
], BallInputDto.prototype, "inningsId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batsman ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid batsman ID format' }),
    __metadata("design:type", String)
], BallInputDto.prototype, "batsmanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bowler ID',
        example: '550e8400-e29b-41d4-a716-446655440002',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid bowler ID format' }),
    __metadata("design:type", String)
], BallInputDto.prototype, "bowlerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Runs scored on this ball',
        example: 4,
        minimum: 0,
        maximum: 6,
    }),
    (0, class_validator_1.IsInt)({ message: 'Runs must be an integer' }),
    (0, class_validator_1.Min)(0, { message: 'Runs cannot be negative' }),
    (0, class_validator_1.Max)(6, { message: 'Maximum 6 runs per ball' }),
    __metadata("design:type", Number)
], BallInputDto.prototype, "runs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional penalty runs on this delivery (e.g. 5-run penalty). The +1 wide/no-ball penalty is added automatically; byes/leg-byes go here only when combined with wide/no-ball.',
        example: 0,
        minimum: 0,
        maximum: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Extra runs must be an integer' }),
    (0, class_validator_1.Min)(0, { message: 'Extra runs cannot be negative' }),
    (0, class_validator_1.Max)(10, { message: 'Maximum 10 extra runs' }),
    __metadata("design:type", Number)
], BallInputDto.prototype, "extraRuns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a wide ball?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isWide must be a boolean' }),
    __metadata("design:type", Boolean)
], BallInputDto.prototype, "isWide", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a no ball?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isNoBall must be a boolean' }),
    __metadata("design:type", Boolean)
], BallInputDto.prototype, "isNoBall", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a bye?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isBye must be a boolean' }),
    __metadata("design:type", Boolean)
], BallInputDto.prototype, "isBye", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a leg bye?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isLegBye must be a boolean' }),
    __metadata("design:type", Boolean)
], BallInputDto.prototype, "isLegBye", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a wicket?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isWicket must be a boolean' }),
    __metadata("design:type", Boolean)
], BallInputDto.prototype, "isWicket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of dismissal (if wicket)',
        enum: ball_entity_1.DismissalType,
        example: 'bowled',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ball_entity_1.DismissalType, { message: 'Invalid dismissal type' }),
    __metadata("design:type", String)
], BallInputDto.prototype, "wicketType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dismissed player ID (if run out)',
        example: '550e8400-e29b-41d4-a716-446655440003',
        format: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid dismissed player ID format' }),
    __metadata("design:type", String)
], BallInputDto.prototype, "dismissedPlayerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ball commentary',
        example: 'Four! Through the covers',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BallInputDto.prototype, "commentary", void 0);
//# sourceMappingURL=ball-input.dto.js.map