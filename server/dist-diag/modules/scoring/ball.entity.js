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
exports.Ball = exports.DismissalType = void 0;
const typeorm_1 = require("typeorm");
const innings_entity_1 = require("../innings/innings.entity");
const match_entity_1 = require("../match/match.entity");
var DismissalType;
(function (DismissalType) {
    DismissalType["BOWLED"] = "bowled";
    DismissalType["CAUGHT"] = "caught";
    DismissalType["LBW"] = "lbw";
    DismissalType["RUNOUT"] = "runout";
    DismissalType["STUMPED"] = "stumped";
    DismissalType["CAUGHT_AND_BOWLED"] = "caught_and_bowled";
    DismissalType["HIT_WICKET"] = "hit_wicket";
    DismissalType["RETIRED_HURT"] = "retired_hurt";
})(DismissalType || (exports.DismissalType = DismissalType = {}));
let Ball = class Ball {
};
exports.Ball = Ball;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ball.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'over_number' }),
    __metadata("design:type", Number)
], Ball.prototype, "overNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ball_number' }),
    __metadata("design:type", Number)
], Ball.prototype, "ballNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Ball.prototype, "runs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extra_runs', default: 0 }),
    __metadata("design:type", Number)
], Ball.prototype, "extraRuns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_wide', default: false }),
    __metadata("design:type", Boolean)
], Ball.prototype, "isWide", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_no_ball', default: false }),
    __metadata("design:type", Boolean)
], Ball.prototype, "isNoBall", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_bye', default: false }),
    __metadata("design:type", Boolean)
], Ball.prototype, "isBye", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_leg_bye', default: false }),
    __metadata("design:type", Boolean)
], Ball.prototype, "isLegBye", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_wicket', default: false }),
    __metadata("design:type", Boolean)
], Ball.prototype, "isWicket", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DismissalType,
        nullable: true,
    }),
    __metadata("design:type", String)
], Ball.prototype, "wicketType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'innings_id', nullable: false }),
    __metadata("design:type", String)
], Ball.prototype, "inningsId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => innings_entity_1.Innings, (innings) => innings.balls),
    (0, typeorm_1.JoinColumn)({ name: 'innings_id' }),
    __metadata("design:type", innings_entity_1.Innings)
], Ball.prototype, "innings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: false }),
    __metadata("design:type", String)
], Ball.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.balls),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], Ball.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batsman_id', nullable: false }),
    __metadata("design:type", String)
], Ball.prototype, "batsmanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowler_id', nullable: false }),
    __metadata("design:type", String)
], Ball.prototype, "bowlerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dismissed_player_id', nullable: true }),
    __metadata("design:type", String)
], Ball.prototype, "dismissedPlayerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ball.prototype, "commentary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Ball.prototype, "createdAt", void 0);
exports.Ball = Ball = __decorate([
    (0, typeorm_1.Entity)('balls'),
    (0, typeorm_1.Index)(['inningsId']),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['batsmanId']),
    (0, typeorm_1.Index)(['bowlerId'])
], Ball);
//# sourceMappingURL=ball.entity.js.map