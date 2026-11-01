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
exports.SelectPlaying11Dto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SelectPlaying11Dto {
}
exports.SelectPlaying11Dto = SelectPlaying11Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of regular player IDs',
        example: [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
        ],
        format: 'uuid',
    }),
    (0, class_validator_1.IsArray)({ message: 'Player IDs must be provided as an array' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each player ID must be a valid UUID' }),
    __metadata("design:type", Array)
], SelectPlaying11Dto.prototype, "playerIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of guest player IDs (optional)',
        example: [
            '550e8400-e29b-41d4-a716-446655440010',
            '550e8400-e29b-41d4-a716-446655440011',
        ],
        format: 'uuid',
    }),
    (0, class_validator_1.IsArray)({ message: 'Guest player IDs must be provided as an array' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each guest player ID must be a valid UUID' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SelectPlaying11Dto.prototype, "guestPlayerIds", void 0);
//# sourceMappingURL=select-playing11.dto.js.map