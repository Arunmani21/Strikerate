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
exports.UpdateScorerRoleDto = exports.GrantScorerAccessDto = exports.RevokeScorerAccessDto = exports.RejectScorerTransferDto = exports.AcceptScorerTransferDto = exports.TransferScorerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const scorer_permission_entity_1 = require("../scorer-permission.entity");
class TransferScorerDto {
}
exports.TransferScorerDto = TransferScorerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to transfer scoring permissions to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransferScorerDto.prototype, "transferToUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for transfer',
        example: 'Need to go bat in second innings',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferScorerDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Role to assign to new scorer',
        example: 'primary_scorer',
        enum: scorer_permission_entity_1.ScorerRole,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(scorer_permission_entity_1.ScorerRole),
    __metadata("design:type", String)
], TransferScorerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to revoke current scorer permissions',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TransferScorerDto.prototype, "revokeCurrentPermissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated time away (in minutes)',
        example: 45,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], TransferScorerDto.prototype, "estimatedTimeAway", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes',
        example: 'Will take over again after batting',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferScorerDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Metadata for tracking',
        example: { urgency: 'high', batPosition: 3 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TransferScorerDto.prototype, "metadata", void 0);
class AcceptScorerTransferDto {
}
exports.AcceptScorerTransferDto = AcceptScorerTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer request ID to accept',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AcceptScorerTransferDto.prototype, "transferRequestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Acceptance notes',
        example: 'Taking over scoring duties',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptScorerTransferDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to immediately activate scoring permissions',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AcceptScorerTransferDto.prototype, "activateImmediately", void 0);
class RejectScorerTransferDto {
}
exports.RejectScorerTransferDto = RejectScorerTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer request ID to reject',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RejectScorerTransferDto.prototype, "transferRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for rejection',
        example: 'Busy with other tasks',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectScorerTransferDto.prototype, "reason", void 0);
class RevokeScorerAccessDto {
}
exports.RevokeScorerAccessDto = RevokeScorerAccessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to revoke scoring access from',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RevokeScorerAccessDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for revocation',
        example: 'Scoring duties completed',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RevokeScorerAccessDto.prototype, "reason", void 0);
class GrantScorerAccessDto {
}
exports.GrantScorerAccessDto = GrantScorerAccessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to grant scoring access to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GrantScorerAccessDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role to assign',
        example: 'secondary_scorer',
        enum: scorer_permission_entity_1.ScorerRole,
    }),
    (0, class_validator_1.IsEnum)(scorer_permission_entity_1.ScorerRole),
    __metadata("design:type", String)
], GrantScorerAccessDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for granting access',
        example: 'Assisting with scoring',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantScorerAccessDto.prototype, "reason", void 0);
class UpdateScorerRoleDto {
}
exports.UpdateScorerRoleDto = UpdateScorerRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to update role for',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateScorerRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New role to assign',
        example: 'primary_scorer',
        enum: scorer_permission_entity_1.ScorerRole,
    }),
    (0, class_validator_1.IsEnum)(scorer_permission_entity_1.ScorerRole),
    __metadata("design:type", String)
], UpdateScorerRoleDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for role change',
        example: 'Promoting to primary scorer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScorerRoleDto.prototype, "reason", void 0);
//# sourceMappingURL=scorer-transfer.dto.js.map