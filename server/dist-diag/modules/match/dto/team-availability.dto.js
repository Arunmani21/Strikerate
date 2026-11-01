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
exports.TeamAvailabilityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TeamAvailabilityDto {
}
exports.TeamAvailabilityDto = TeamAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date available for match (YYYY-MM-DD format)',
        example: '2024-03-25',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid date in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], TeamAvailabilityDto.prototype, "availableDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available from time (HH:MM format)',
        example: '09:00',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamAvailabilityDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available until time (HH:MM format)',
        example: '18:00',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamAvailabilityDto.prototype, "availableUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred venue for matches',
        example: 'Mumbai Cricket Ground',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200, { message: 'Venue must not exceed 200 characters' }),
    __metadata("design:type", String)
], TeamAvailabilityDto.prototype, "venue", void 0);
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
], TeamAvailabilityDto.prototype, "preferredOvers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes or requirements',
        example: 'Looking for T20 match on weekend',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Notes must not exceed 1000 characters' }),
    __metadata("design:type", String)
], TeamAvailabilityDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether open to receiving match requests',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'is_open must be a boolean value' }),
    __metadata("design:type", Boolean)
], TeamAvailabilityDto.prototype, "isOpen", void 0);
//# sourceMappingURL=team-availability.dto.js.map