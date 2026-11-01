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
exports.TossDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const match_entity_1 = require("../match.entity");
class TossDto {
}
exports.TossDto = TossDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Winning team ID (must be one of the match teams)',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid team ID format' }),
    __metadata("design:type", String)
], TossDto.prototype, "tossWinnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Toss decision',
        enum: match_entity_1.TossDecision,
        example: 'bat',
    }),
    (0, class_validator_1.IsEnum)(match_entity_1.TossDecision, { message: 'Invalid toss decision' }),
    __metadata("design:type", String)
], TossDto.prototype, "tossChoice", void 0);
//# sourceMappingURL=toss.dto.js.map