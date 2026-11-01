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
exports.Innings = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("../match/match.entity");
const ball_entity_1 = require("../scoring/ball.entity");
let Innings = class Innings {
};
exports.Innings = Innings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Innings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'innings_number' }),
    __metadata("design:type", Number)
], Innings.prototype, "inningsNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_runs', default: 0 }),
    __metadata("design:type", Number)
], Innings.prototype, "totalRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_wickets', default: 0 }),
    __metadata("design:type", Number)
], Innings.prototype, "totalWickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_balls', default: 0 }),
    __metadata("design:type", Number)
], Innings.prototype, "totalBalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_over', default: 0 }),
    __metadata("design:type", Number)
], Innings.prototype, "currentOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_completed', default: false }),
    __metadata("design:type", Boolean)
], Innings.prototype, "isCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: false }),
    __metadata("design:type", String)
], Innings.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.innings),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], Innings.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_team_id', nullable: false }),
    __metadata("design:type", String)
], Innings.prototype, "battingTeamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_team_id', nullable: false }),
    __metadata("design:type", String)
], Innings.prototype, "bowlingTeamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'striker_id', nullable: true }),
    __metadata("design:type", String)
], Innings.prototype, "strikerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_striker_id', nullable: true }),
    __metadata("design:type", String)
], Innings.prototype, "nonStrikerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_bowler_id', nullable: true }),
    __metadata("design:type", String)
], Innings.prototype, "currentBowlerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ball_entity_1.Ball, (ball) => ball.innings),
    __metadata("design:type", Array)
], Innings.prototype, "balls", void 0);
exports.Innings = Innings = __decorate([
    (0, typeorm_1.Entity)('innings'),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['battingTeamId']),
    (0, typeorm_1.Index)(['bowlingTeamId'])
], Innings);
//# sourceMappingURL=innings.entity.js.map