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
exports.SuperOver = exports.SuperOverType = exports.SuperOverStatus = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
const team_entity_1 = require("../team/team.entity");
var SuperOverStatus;
(function (SuperOverStatus) {
    SuperOverStatus["SCHEDULED"] = "scheduled";
    SuperOverStatus["IN_PROGRESS"] = "in_progress";
    SuperOverStatus["COMPLETED"] = "completed";
    SuperOverStatus["ABANDONED"] = "abandoned";
})(SuperOverStatus || (exports.SuperOverStatus = SuperOverStatus = {}));
var SuperOverType;
(function (SuperOverType) {
    SuperOverType["STANDARD"] = "standard";
    SuperOverType["TIE_BREAKER"] = "tie_breaker";
})(SuperOverType || (exports.SuperOverType = SuperOverType = {}));
let SuperOver = class SuperOver {
};
exports.SuperOver = SuperOver;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SuperOver.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id' }),
    __metadata("design:type", String)
], SuperOver.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.superOvers, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], SuperOver.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_a_id' }),
    __metadata("design:type", String)
], SuperOver.prototype, "teamAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.superOversAsTeamA, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_a_id' }),
    __metadata("design:type", team_entity_1.Team)
], SuperOver.prototype, "teamA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_b_id' }),
    __metadata("design:type", String)
], SuperOver.prototype, "teamBId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.superOversAsTeamB, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_b_id' }),
    __metadata("design:type", team_entity_1.Team)
], SuperOver.prototype, "teamB", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SuperOverType,
        default: SuperOverType.STANDARD,
    }),
    __metadata("design:type", String)
], SuperOver.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SuperOverStatus,
        default: SuperOverStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], SuperOver.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_a_batting_first', default: false }),
    __metadata("design:type", Boolean)
], SuperOver.prototype, "teamABattingFirst", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'toss_winner_team_id', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "tossWinnerTeamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'toss_choice', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "tossChoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_over', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "currentOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_ball', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "currentBall", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_a_runs', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "teamARuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_a_wickets', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "teamAWickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_b_runs', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "teamBRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_b_wickets', default: 0 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "teamBWickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_runs', nullable: true }),
    __metadata("design:type", Number)
], SuperOver.prototype, "targetRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'won_by_team_id', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "wonByTeamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'margin', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "margin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], SuperOver.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'super_over_number', default: 1 }),
    __metadata("design:type", Number)
], SuperOver.prototype, "superOverNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SuperOver.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SuperOver.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SuperOver.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_changed_at', nullable: true }),
    __metadata("design:type", Date)
], SuperOver.prototype, "statusChangedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_changed_by', nullable: true }),
    __metadata("design:type", String)
], SuperOver.prototype, "statusChangedBy", void 0);
exports.SuperOver = SuperOver = __decorate([
    (0, typeorm_1.Entity)('super_overs'),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['teamABattingFirst']),
    (0, typeorm_1.Index)(['status'])
], SuperOver);
//# sourceMappingURL=super-over.entity.js.map