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
exports.Team = void 0;
const typeorm_1 = require("typeorm");
const team_member_entity_1 = require("./team-member.entity");
const player_entity_1 = require("../player/player.entity");
const team_availability_entity_1 = require("../match/team-availability.entity");
const match_entity_1 = require("../match/match.entity");
const match_request_entity_1 = require("../match/match-request.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_match_performance_entity_1 = require("../stats/player-match-performance.entity");
const team_match_history_entity_1 = require("../stats/team-match-history.entity");
const super_over_entity_1 = require("../match/super-over.entity");
let Team = class Team {
};
exports.Team = Team;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], Team.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'home_ground', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "homeGround", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'captain_id', nullable: false }),
    __metadata("design:type", String)
], Team.prototype, "captainId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: false }),
    __metadata("design:type", String)
], Team.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Team.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Team.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, (teamMember) => teamMember.team),
    __metadata("design:type", Array)
], Team.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_entity_1.Player, (player) => player.team),
    __metadata("design:type", Array)
], Team.prototype, "players", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_availability_entity_1.TeamAvailability, (availability) => availability.team),
    __metadata("design:type", Array)
], Team.prototype, "availabilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (match) => match.teamA),
    __metadata("design:type", Array)
], Team.prototype, "homeMatches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (match) => match.teamB),
    __metadata("design:type", Array)
], Team.prototype, "awayMatches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_request_entity_1.MatchRequest, (request) => request.requestingTeam),
    __metadata("design:type", Array)
], Team.prototype, "sentRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_request_entity_1.MatchRequest, (request) => request.opponentTeam),
    __metadata("design:type", Array)
], Team.prototype, "receivedRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => playing11_entity_1.Playing11, (playing11) => playing11.team),
    __metadata("design:type", Array)
], Team.prototype, "playing11", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_match_performance_entity_1.PlayerMatchPerformance, (performance) => performance.team),
    __metadata("design:type", Array)
], Team.prototype, "performances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_match_history_entity_1.TeamMatchHistory, (history) => history.team),
    __metadata("design:type", Array)
], Team.prototype, "matchHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => super_over_entity_1.SuperOver, (superOver) => superOver.teamA),
    __metadata("design:type", Array)
], Team.prototype, "superOversAsTeamA", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => super_over_entity_1.SuperOver, (superOver) => superOver.teamB),
    __metadata("design:type", Array)
], Team.prototype, "superOversAsTeamB", void 0);
exports.Team = Team = __decorate([
    (0, typeorm_1.Entity)('teams')
], Team);
//# sourceMappingURL=team.entity.js.map