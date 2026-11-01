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
exports.PlayerCareerStats = void 0;
const typeorm_1 = require("typeorm");
const player_entity_1 = require("../player/player.entity");
let PlayerCareerStats = class PlayerCareerStats {
};
exports.PlayerCareerStats = PlayerCareerStats;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlayerCareerStats.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_matches', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalMatches", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_innings', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalInnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_runs', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'highest_score', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "highestScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_fours', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalFours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_sixes', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalSixes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_fifties', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalFifties", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_hundreds', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalHundreds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'career_batting_avg',
        type: 'decimal',
        precision: 7,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "careerBattingAvg", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'career_strike_rate',
        type: 'decimal',
        precision: 7,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "careerStrikeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_not_outs', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalNotOuts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_ducks', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalDucks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_wickets', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalWickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_overs_bowled', type: 'decimal', precision: 7, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalOversBowled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_runs_conceded', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalRunsConceded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'best_bowling', nullable: true }),
    __metadata("design:type", String)
], PlayerCareerStats.prototype, "bestBowling", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'career_economy',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "careerEconomy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'five_wicket_hauls', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "fiveWicketHauls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_maidens', default: 0 }),
    __metadata("design:type", Number)
], PlayerCareerStats.prototype, "totalMaidens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player_id', nullable: false }),
    __metadata("design:type", String)
], PlayerCareerStats.prototype, "playerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (player) => player.careerStats, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'player_id' }),
    __metadata("design:type", player_entity_1.Player)
], PlayerCareerStats.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", String)
], PlayerCareerStats.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PlayerCareerStats.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PlayerCareerStats.prototype, "updatedAt", void 0);
exports.PlayerCareerStats = PlayerCareerStats = __decorate([
    (0, typeorm_1.Entity)('player_career_stats'),
    (0, typeorm_1.Index)(['playerId']),
    (0, typeorm_1.Index)(['userId'])
], PlayerCareerStats);
//# sourceMappingURL=player-career-stats.entity.js.map