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
exports.SetCaptainDto = exports.UpdatePersonalAvailabilityDto = exports.UpdateTeamAvailabilityDto = exports.DeleteTeamDto = exports.RemoveTeamMemberDto = exports.AddTeamMemberDto = exports.UpdateMemberRoleDto = exports.UpdateTeamDetailsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const team_roles_1 = require("../team-roles");
class UpdateTeamDetailsDto {
}
exports.UpdateTeamDetailsDto = UpdateTeamDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Team name',
        example: 'Mumbai Indians',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateTeamDetailsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Home ground/venue',
        example: 'Wankhede Stadium',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDetailsDto.prototype, "homeGround", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Team description',
        example: 'Five-time IPL champions',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDetailsDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Team logo URL',
        example: 'https://example.com/logos/mi.png',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDetailsDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional team metadata',
        example: { foundedYear: 2008, owner: 'Reliance Industries' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateTeamDetailsDto.prototype, "metadata", void 0);
class UpdateMemberRoleDto {
}
exports.UpdateMemberRoleDto = UpdateMemberRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New role for the team member',
        enum: team_roles_1.TeamRole,
        example: team_roles_1.TeamRole.CAPTAIN,
    }),
    (0, class_validator_1.IsEnum)(team_roles_1.TeamRole),
    __metadata("design:type", String)
], UpdateMemberRoleDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for role change',
        example: 'Promoted to captain due to leadership skills',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMemberRoleDto.prototype, "reason", void 0);
class AddTeamMemberDto {
}
exports.AddTeamMemberDto = AddTeamMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to add to team',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role for the new member',
        enum: team_roles_1.TeamRole,
        example: team_roles_1.TeamRole.PLAYER,
        default: team_roles_1.TeamRole.PLAYER,
    }),
    (0, class_validator_1.IsEnum)(team_roles_1.TeamRole),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jersey number',
        example: 10,
        minimum: 1,
        maximum: 999,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(999),
    __metadata("design:type", Number)
], AddTeamMemberDto.prototype, "jerseyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Batting style',
        example: 'right-handed',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "battingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bowling style',
        example: 'right-arm fast',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "bowlingStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Player type',
        example: 'all-rounder',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddTeamMemberDto.prototype, "playerType", void 0);
class RemoveTeamMemberDto {
}
exports.RemoveTeamMemberDto = RemoveTeamMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to remove from team',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RemoveTeamMemberDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for removal',
        example: 'Player requested to leave the team',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveTeamMemberDto.prototype, "reason", void 0);
class DeleteTeamDto {
}
exports.DeleteTeamDto = DeleteTeamDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for deletion',
        example: 'Team disbanded',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteTeamDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { disbandedDate: '2026-04-08', membersNotified: true },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DeleteTeamDto.prototype, "details", void 0);
class UpdateTeamAvailabilityDto {
}
exports.UpdateTeamAvailabilityDto = UpdateTeamAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Match ID for which availability is being set',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTeamAvailabilityDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is the team available for this match?',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTeamAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Availability notes',
        example: 'All key players available',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamAvailabilityDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expected lineup strength',
        example: 'full-strength',
        enum: ['full-strength', 'weakened', 'experimental', 'mixed'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamAvailabilityDto.prototype, "lineupStrength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional availability details',
        example: { keyPlayersAvailable: 11, injuries: 0 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateTeamAvailabilityDto.prototype, "details", void 0);
class UpdatePersonalAvailabilityDto {
}
exports.UpdatePersonalAvailabilityDto = UpdatePersonalAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Match ID for which availability is being set',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePersonalAvailabilityDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is the player available for this match?',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePersonalAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for unavailability',
        example: 'Work commitment',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonalAvailabilityDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details',
        example: { availableFrom: '2026-04-10', availableUntil: '2026-04-15' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePersonalAvailabilityDto.prototype, "details", void 0);
class SetCaptainDto {
}
exports.SetCaptainDto = SetCaptainDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Captain user ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetCaptainDto.prototype, "captainId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vice-captain user ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetCaptainDto.prototype, "viceCaptainId", void 0);
//# sourceMappingURL=team-management.dto.js.map