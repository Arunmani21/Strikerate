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
exports.PlayerMatchPerformance = void 0;
const typeorm_1 = require("typeorm");
const player_entity_1 = require("../player/player.entity");
const match_entity_1 = require("../match/match.entity");
const team_entity_1 = require("../team/team.entity");
let PlayerMatchPerformance = class PlayerMatchPerformance {
};
exports.PlayerMatchPerformance = PlayerMatchPerformance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlayerMatchPerformance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'runs_scored', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "runsScored", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balls_faced', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "ballsFaced", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "fours", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "sixes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strike_rate', type: 'decimal', precision: 7, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "strikeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_out', default: false }),
    __metadata("design:type", Boolean)
], PlayerMatchPerformance.prototype, "isOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wicket_type', nullable: true }),
    __metadata("design:type", String)
], PlayerMatchPerformance.prototype, "wicketType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_position', nullable: true }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "battingPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_retired_hurt', default: false }),
    __metadata("design:type", Boolean)
], PlayerMatchPerformance.prototype, "isRetiredHurt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retired_hurt_at', nullable: true }),
    __metadata("design:type", Date)
], PlayerMatchPerformance.prototype, "retiredHurtAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retired_hurt_ball_number', nullable: true }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "retiredHurtBallNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'returned_from_retirement', default: false }),
    __metadata("design:type", Boolean)
], PlayerMatchPerformance.prototype, "returnedFromRetirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'returned_at_ball', nullable: true }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "returnedAtBall", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overs_bowled', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "oversBowled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'runs_conceded', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "runsConceded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wickets_taken', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "wicketsTaken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "economy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "maidens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wides', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "wides", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'no_balls', default: 0 }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "noBalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_rating', type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], PlayerMatchPerformance.prototype, "matchRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_player_of_match', default: false }),
    __metadata("design:type", Boolean)
], PlayerMatchPerformance.prototype, "isPlayerOfMatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player_id', nullable: false }),
    __metadata("design:type", String)
], PlayerMatchPerformance.prototype, "playerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (player) => player.matchPerformances, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'player_id' }),
    __metadata("design:type", player_entity_1.Player)
], PlayerMatchPerformance.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: false }),
    __metadata("design:type", String)
], PlayerMatchPerformance.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.performances, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], PlayerMatchPerformance.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', nullable: false }),
    __metadata("design:type", String)
], PlayerMatchPerformance.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.performances, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], PlayerMatchPerformance.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PlayerMatchPerformance.prototype, "createdAt", void 0);
exports.PlayerMatchPerformance = PlayerMatchPerformance = __decorate([
    (0, typeorm_1.Entity)('player_match_performances'),
    (0, typeorm_1.Index)(['playerId']),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['teamId'])
], PlayerMatchPerformance);
//# sourceMappingURL=player-match-performance.entity.js.map