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
exports.ScorerPermission = exports.TransferStatus = exports.ScorerRole = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("../match/match.entity");
const user_entity_1 = require("../user/user.entity");
var ScorerRole;
(function (ScorerRole) {
    ScorerRole["PRIMARY_SCORER"] = "primary_scorer";
    ScorerRole["SECONDARY_SCORER"] = "secondary_scorer";
    ScorerRole["TEMPORARY_SCORER"] = "temporary_scorer";
    ScorerRole["VIEWER"] = "viewer";
})(ScorerRole || (exports.ScorerRole = ScorerRole = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["ACCEPTED"] = "accepted";
    TransferStatus["REJECTED"] = "rejected";
    TransferStatus["REVOKED"] = "revoked";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
let ScorerPermission = class ScorerPermission {
};
exports.ScorerPermission = ScorerPermission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScorerPermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id' }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], ScorerPermission.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ScorerPermission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ScorerRole,
        default: ScorerRole.VIEWER,
    }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ScorerPermission.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'can_score', default: false }),
    __metadata("design:type", Boolean)
], ScorerPermission.prototype, "canScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transferred_from', nullable: true }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "transferredFrom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'transferred_from' }),
    __metadata("design:type", user_entity_1.User)
], ScorerPermission.prototype, "transferredFromUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transferred_to', nullable: true }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "transferredTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'transferred_to' }),
    __metadata("design:type", user_entity_1.User)
], ScorerPermission.prototype, "transferredToUser", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
    }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "transferStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transferred_at', nullable: true }),
    __metadata("design:type", Date)
], ScorerPermission.prototype, "transferredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepted_at', nullable: true }),
    __metadata("design:type", Date)
], ScorerPermission.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_at', nullable: true }),
    __metadata("design:type", Date)
], ScorerPermission.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_reason', nullable: true }),
    __metadata("design:type", String)
], ScorerPermission.prototype, "transferReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ScorerPermission.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ScorerPermission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], ScorerPermission.prototype, "updatedAt", void 0);
exports.ScorerPermission = ScorerPermission = __decorate([
    (0, typeorm_1.Entity)('scorer_permissions'),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['transferredFrom']),
    (0, typeorm_1.Index)(['transferredTo'])
], ScorerPermission);
//# sourceMappingURL=scorer-permission.entity.js.map