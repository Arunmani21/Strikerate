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
exports.SuperOverStatusDto = exports.AbandonSuperOverDto = exports.CompleteSuperOverDto = exports.SuperOverBallDto = exports.StartSuperOverDto = exports.SuperOverDecisionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const super_over_entity_1 = require("../super-over.entity");
class SuperOverDecisionDto {
}
exports.SuperOverDecisionDto = SuperOverDecisionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Decision: Draw or Super Over',
        example: 'super_over',
        enum: ['draw', 'super_over'],
    }),
    (0, class_validator_1.IsEnum)(['draw', 'super_over']),
    __metadata("design:type", String)
], SuperOverDecisionDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for decision',
        example: 'Teams agreed to play super over to determine winner',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuperOverDecisionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional information',
        example: { tournamentRules: 'ICC Super Over Rules apply', reserveDayAvailable: false },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SuperOverDecisionDto.prototype, "metadata", void 0);
class StartSuperOverDto {
}
exports.StartSuperOverDto = StartSuperOverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Super Over type',
        example: 'standard',
        enum: super_over_entity_1.SuperOverType,
    }),
    (0, class_validator_1.IsEnum)(super_over_entity_1.SuperOverType),
    __metadata("design:type", String)
], StartSuperOverDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Team that won the toss',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StartSuperOverDto.prototype, "tossWinnerTeamId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Toss decision',
        example: 'bat',
        enum: ['bat', 'bowl'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['bat', 'bowl']),
    __metadata("design:type", String)
], StartSuperOverDto.prototype, "tossChoice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target runs (if applicable)',
        example: 15,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StartSuperOverDto.prototype, "targetRuns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes',
        example: 'Super over to decide winner of tied match',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartSuperOverDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { matchContext: 'India vs Australia, T20 World Cup final' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], StartSuperOverDto.prototype, "metadata", void 0);
class SuperOverBallDto {
}
exports.SuperOverBallDto = SuperOverBallDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Super Over ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "superOverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batsman ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "batsmanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bowler ID',
        example: '550e8400-e29b-41d4-a716-446655440002',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "bowlerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Runs scored on this ball',
        example: 2,
        minimum: 0,
        maximum: 6,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], SuperOverBallDto.prototype, "runs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a wide ball?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuperOverBallDto.prototype, "isWide", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a no ball?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuperOverBallDto.prototype, "isNoBall", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a bye ball?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuperOverBallDto.prototype, "isBye", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a leg bye?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuperOverBallDto.prototype, "isLegBye", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a wicket?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuperOverBallDto.prototype, "isWicket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Wicket type (if wicket)',
        example: 'bowled',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "wicketType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dismissed player ID (if run out)',
        example: '550e8400-e29b-41d4-a716-446655440003',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "dismissedPlayerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ball commentary',
        example: 'FOUR! Through the covers for boundary',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuperOverBallDto.prototype, "commentary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { over: 1, ball: 3, matchSituation: 'India needs 3 runs to win' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SuperOverBallDto.prototype, "metadata", void 0);
class CompleteSuperOverDto {
}
exports.CompleteSuperOverDto = CompleteSuperOverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Winning team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CompleteSuperOverDto.prototype, "winningTeamId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Margin of victory',
        example: '2 runs',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteSuperOverDto.prototype, "margin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { superOverNumber: 1, endedBy: 'wickets', ballsFaced: 8 },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CompleteSuperOverDto.prototype, "details", void 0);
class AbandonSuperOverDto {
}
exports.AbandonSuperOverDto = AbandonSuperOverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for abandonment',
        example: 'rain',
    }),
    (0, class_validator_1.IsEnum)(['rain', 'bad_light', 'injury', 'equipment', 'crowd', 'other']),
    __metadata("design:type", String)
], AbandonSuperOverDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed explanation',
        example: 'Persistent rain made super over impossible',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AbandonSuperOverDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Match situation at abandonment',
        example: { teamA: { runs: 15, wickets: 1 }, teamB: { runs: 12, wickets: 0 } },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AbandonSuperOverDto.prototype, "matchSituation", void 0);
class SuperOverStatusDto {
}
exports.SuperOverStatusDto = SuperOverStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New super over status',
        example: 'in_progress',
        enum: super_over_entity_1.SuperOverStatus,
    }),
    (0, class_validator_1.IsEnum)(super_over_entity_1.SuperOverStatus),
    __metadata("design:type", String)
], SuperOverStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Status change reason',
        example: 'Super over completed - Team A won by 2 runs',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuperOverStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=super-over.dto.js.map