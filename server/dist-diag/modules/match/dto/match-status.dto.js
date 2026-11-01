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
exports.CancelMatchDto = exports.PostponeMatchDto = exports.ResumeMatchDto = exports.DelayMatchDto = exports.DeclareMatchDrawDto = exports.DeclareMatchTiedDto = exports.CompleteMatchDto = exports.AbandonMatchDto = exports.UpdateMatchStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const match_entity_1 = require("../match.entity");
class UpdateMatchStatusDto {
}
exports.UpdateMatchStatusDto = UpdateMatchStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New match status',
        enum: match_entity_1.MatchStatus,
        example: match_entity_1.MatchStatus.LIVE,
    }),
    (0, class_validator_1.IsEnum)(match_entity_1.MatchStatus),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for status change',
        example: 'Match started on time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Winning team ID (for completed matches)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "winningTeamId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Margin of victory',
        example: '5 wickets',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "marginOfVictory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of margin (runs, wickets)',
        example: 'wickets',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "marginType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details about status change',
        example: { weather: 'Rain stopped play', oversRemaining: 15 },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateMatchStatusDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weather conditions at time of status change',
        example: 'Heavy rain, water on outfield',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMatchStatusDto.prototype, "weatherConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Overs bowled so far (for abandoned matches)',
        example: 35.4,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMatchStatusDto.prototype, "oversBowled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total overs that were to be bowled',
        example: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMatchStatusDto.prototype, "totalOversBowled", void 0);
class AbandonMatchDto {
}
exports.AbandonMatchDto = AbandonMatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for abandonment',
        example: 'rain',
    }),
    (0, class_validator_1.IsEnum)(['rain', 'bad_light', 'pitch_conditions', 'crowd_trouble', 'security', 'other']),
    __metadata("design:type", String)
], AbandonMatchDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed explanation',
        example: 'Persistent heavy rain made the field unplayable',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AbandonMatchDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weather conditions',
        example: 'Heavy rain, water on outfield, covers ineffective',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AbandonMatchDto.prototype, "weatherConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Overs bowled before abandonment',
        example: 35.4,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AbandonMatchDto.prototype, "oversBowled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total overs scheduled',
        example: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AbandonMatchDto.prototype, "totalOvers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Match can be resumed later',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AbandonMatchDto.prototype, "canBeResumed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional information',
        example: { rainStarted: '14:30', estimatedClearTime: '18:00' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AbandonMatchDto.prototype, "metadata", void 0);
class CompleteMatchDto {
}
exports.CompleteMatchDto = CompleteMatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Winning team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CompleteMatchDto.prototype, "winningTeamId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of victory',
        example: 'runs',
    }),
    (0, class_validator_1.IsEnum)(['runs', 'wickets', 'innings', 'forfeit']),
    __metadata("design:type", String)
], CompleteMatchDto.prototype, "victoryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Margin of victory',
        example: 5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CompleteMatchDto.prototype, "margin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Result description',
        example: 'India won by 5 wickets',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteMatchDto.prototype, "resultDescription", void 0);
class DeclareMatchTiedDto {
}
exports.DeclareMatchTiedDto = DeclareMatchTiedDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tie description',
        example: 'Both teams scored 250 runs',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeclareMatchTiedDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { superOver: 'India won super over' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeclareMatchTiedDto.prototype, "details", void 0);
class DeclareMatchDrawDto {
}
exports.DeclareMatchDrawDto = DeclareMatchDrawDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Draw description',
        example: 'Match ended in a draw after 5 days',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeclareMatchDrawDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for draw',
        example: 'Time ran out, both teams agreed to draw',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeclareMatchDrawDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { innings: { teamA: 4, teamB: 4 }, days: 5 },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeclareMatchDrawDto.prototype, "details", void 0);
class DelayMatchDto {
}
exports.DelayMatchDto = DelayMatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of delay',
        enum: ['rain', 'bad_light'],
        example: 'rain',
    }),
    (0, class_validator_1.IsEnum)(['rain', 'bad_light']),
    __metadata("design:type", String)
], DelayMatchDto.prototype, "delayType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated delay duration (in minutes)',
        example: 45,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DelayMatchDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Delay description',
        example: 'Heavy rain, covers on',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelayMatchDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weather conditions',
        example: 'Heavy rain with strong winds',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelayMatchDto.prototype, "weatherConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current match situation',
        example: { overs: 25.4, score: { teamA: 145, teamB: 132 } },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DelayMatchDto.prototype, "matchSituation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expected resumption time',
        example: '16:30',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelayMatchDto.prototype, "expectedResumption", void 0);
class ResumeMatchDto {
}
exports.ResumeMatchDto = ResumeMatchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resumption description',
        example: 'Play resumed after rain delay',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResumeMatchDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time lost (in minutes)',
        example: 75,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ResumeMatchDto.prototype, "timeLost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Overs reduced (if any)',
        example: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResumeMatchDto.prototype, "oversReduced", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { revisedOvers: 45, newSessionTime: '16:45' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ResumeMatchDto.prototype, "details", void 0);
class PostponeMatchDto {
}
exports.PostponeMatchDto = PostponeMatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for postponement',
        example: 'Unplayable weather conditions',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostponeMatchDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rescheduled date',
        example: '2026-04-15',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostponeMatchDto.prototype, "rescheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rescheduled time',
        example: '14:30',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostponeMatchDto.prototype, "rescheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional information',
        example: { originalDate: '2026-04-08', venue: 'Same ground' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PostponeMatchDto.prototype, "details", void 0);
class CancelMatchDto {
}
exports.CancelMatchDto = CancelMatchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for cancellation',
        example: 'Venue unavailable',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelMatchDto.prototype, "reason", void 0);
//# sourceMappingURL=match-status.dto.js.map