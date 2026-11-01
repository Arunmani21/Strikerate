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
exports.Player = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
const player_availability_entity_1 = require("./player-availability.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_match_performance_entity_1 = require("../stats/player-match-performance.entity");
const player_career_stats_entity_1 = require("../stats/player-career-stats.entity");
let Player = class Player {
};
exports.Player = Player;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jersey_number', nullable: true }),
    __metadata("design:type", Number)
], Player.prototype, "jerseyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_runs', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "battingRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_balls', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "battingBalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_fours', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "battingFours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_sixes', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "battingSixes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'batting_strike_rate',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Player.prototype, "battingStrikeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_balls', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "bowlingBalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_runs', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "bowlingRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_wickets', default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "bowlingWickets", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'bowling_economy',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Player.prototype, "bowlingEconomy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'bowling_overs',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Player.prototype, "bowlingOvers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_out', default: false }),
    __metadata("design:type", Boolean)
], Player.prototype, "isOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', nullable: false }),
    __metadata("design:type", String)
], Player.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.players, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Player.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_availability_entity_1.PlayerAvailability, (availability) => availability.player),
    __metadata("design:type", Array)
], Player.prototype, "availabilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => playing11_entity_1.Playing11, (playing11) => playing11.player),
    __metadata("design:type", Array)
], Player.prototype, "playing11", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_match_performance_entity_1.PlayerMatchPerformance, (performance) => performance.player),
    __metadata("design:type", Array)
], Player.prototype, "matchPerformances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_career_stats_entity_1.PlayerCareerStats, (careerStats) => careerStats.player),
    __metadata("design:type", Array)
], Player.prototype, "careerStats", void 0);
exports.Player = Player = __decorate([
    (0, typeorm_1.Entity)('players'),
    (0, typeorm_1.Unique)(['name', 'teamId']),
    (0, typeorm_1.Index)(['teamId']),
    (0, typeorm_1.Index)(['userId'])
], Player);
//# sourceMappingURL=player.entity.js.map