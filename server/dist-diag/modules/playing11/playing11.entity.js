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
exports.Playing11 = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("../match/match.entity");
const team_entity_1 = require("../team/team.entity");
const player_entity_1 = require("../player/player.entity");
const guest_player_entity_1 = require("../player/guest-player.entity");
let Playing11 = class Playing11 {
};
exports.Playing11 = Playing11;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Playing11.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: false }),
    __metadata("design:type", String)
], Playing11.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.playing11, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], Playing11.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', nullable: false }),
    __metadata("design:type", String)
], Playing11.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.playing11, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Playing11.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player_id', nullable: true }),
    __metadata("design:type", String)
], Playing11.prototype, "playerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (player) => player.playing11, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'player_id' }),
    __metadata("design:type", player_entity_1.Player)
], Playing11.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_guest', default: false }),
    __metadata("design:type", Boolean)
], Playing11.prototype, "isGuest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'guest_player_id', nullable: true }),
    __metadata("design:type", String)
], Playing11.prototype, "guestPlayerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => guest_player_entity_1.GuestPlayer, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'guest_player_id' }),
    __metadata("design:type", guest_player_entity_1.GuestPlayer)
], Playing11.prototype, "guestPlayer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selected_by', nullable: false }),
    __metadata("design:type", String)
], Playing11.prototype, "selectedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Playing11.prototype, "createdAt", void 0);
exports.Playing11 = Playing11 = __decorate([
    (0, typeorm_1.Entity)('playing11'),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['teamId']),
    (0, typeorm_1.Index)(['playerId'])
], Playing11);
//# sourceMappingURL=playing11.entity.js.map