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
exports.GuestPlayer = exports.GuestPlayerStatus = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
const match_entity_1 = require("../match/match.entity");
var GuestPlayerStatus;
(function (GuestPlayerStatus) {
    GuestPlayerStatus["ACTIVE"] = "active";
    GuestPlayerStatus["INACTIVE"] = "inactive";
})(GuestPlayerStatus || (exports.GuestPlayerStatus = GuestPlayerStatus = {}));
let GuestPlayer = class GuestPlayer {
};
exports.GuestPlayer = GuestPlayer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuestPlayer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id' }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], GuestPlayer.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], GuestPlayer.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GuestPlayer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GuestPlayerStatus,
        default: GuestPlayerStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_style', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "battingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_style', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "bowlingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GuestPlayer.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_converted', default: false }),
    __metadata("design:type", Boolean)
], GuestPlayer.prototype, "isConverted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'converted_player_id', nullable: true }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "convertedPlayerId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GuestPlayer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], GuestPlayer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'added_by' }),
    __metadata("design:type", String)
], GuestPlayer.prototype, "addedBy", void 0);
exports.GuestPlayer = GuestPlayer = __decorate([
    (0, typeorm_1.Entity)('guest_players'),
    (0, typeorm_1.Index)(['teamId']),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['mobile'])
], GuestPlayer);
//# sourceMappingURL=guest-player.entity.js.map