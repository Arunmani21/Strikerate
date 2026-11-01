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
exports.Match = exports.TossDecision = exports.MatchStatus = exports.MatchFormat = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
const match_request_entity_1 = require("./match-request.entity");
const innings_entity_1 = require("../innings/innings.entity");
const ball_entity_1 = require("../scoring/ball.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_match_performance_entity_1 = require("../stats/player-match-performance.entity");
const team_match_history_entity_1 = require("../stats/team-match-history.entity");
const super_over_entity_1 = require("./super-over.entity");
var MatchFormat;
(function (MatchFormat) {
    MatchFormat["TEST"] = "TEST";
    MatchFormat["ODI"] = "ODI";
    MatchFormat["T20"] = "T20";
    MatchFormat["T10"] = "T10";
})(MatchFormat || (exports.MatchFormat = MatchFormat = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "scheduled";
    MatchStatus["POSTPONED"] = "postponed";
    MatchStatus["CANCELLED"] = "cancelled";
    MatchStatus["TOSS_DONE"] = "toss_done";
    MatchStatus["LIVE"] = "live";
    MatchStatus["INNINGS_BREAK"] = "innings_break";
    MatchStatus["RAIN_DELAYED"] = "rain_delayed";
    MatchStatus["BAD_LIGHT_DELAYED"] = "bad_light_delayed";
    MatchStatus["UMPIRE_DECISION_PENDING"] = "umpire_decision_pending";
    MatchStatus["COMPLETED"] = "completed";
    MatchStatus["TIED"] = "tied";
    MatchStatus["DRAW"] = "draw";
    MatchStatus["ABANDONED"] = "abandoned";
    MatchStatus["NO_RESULT"] = "no_result";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var TossDecision;
(function (TossDecision) {
    TossDecision["BAT"] = "bat";
    TossDecision["BOWL"] = "bowl";
})(TossDecision || (exports.TossDecision = TossDecision = {}));
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_overs', nullable: false }),
    __metadata("design:type", Number)
], Match.prototype, "totalOvers", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_date', type: 'date' }),
    __metadata("design:type", Date)
], Match.prototype, "matchDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_time', type: 'time' }),
    __metadata("design:type", String)
], Match.prototype, "matchTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'toss_winner_id', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "tossWinnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'toss_choice',
        type: 'enum',
        enum: TossDecision,
        nullable: true,
    }),
    __metadata("design:type", String)
], Match.prototype, "tossChoice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_innings', default: 1 }),
    __metadata("design:type", Number)
], Match.prototype, "currentInnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Match.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'winning_team_id', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "winningTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'winning_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "winningTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'margin_of_victory', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "marginOfVictory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'margin_type', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "marginType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_changed_at', nullable: true }),
    __metadata("design:type", Date)
], Match.prototype, "statusChangedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_changed_by', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "statusChangedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'abandonment_reason', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "abandonmentReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'abandonment_details', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "abandonmentDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weather_conditions', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "weatherConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overs_bowled', nullable: true }),
    __metadata("design:type", Number)
], Match.prototype, "oversBowled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_overs_bowled', nullable: true }),
    __metadata("design:type", Number)
], Match.prototype, "totalOversBowled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_a_id', nullable: false }),
    __metadata("design:type", String)
], Match.prototype, "teamAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.homeMatches),
    (0, typeorm_1.JoinColumn)({ name: 'team_a_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "teamA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_b_id', nullable: false }),
    __metadata("design:type", String)
], Match.prototype, "teamBId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.awayMatches),
    (0, typeorm_1.JoinColumn)({ name: 'team_b_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "teamB", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: false }),
    __metadata("design:type", String)
], Match.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_request_id', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "matchRequestId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_request_entity_1.MatchRequest, (request) => request.matches),
    (0, typeorm_1.JoinColumn)({ name: 'match_request_id' }),
    __metadata("design:type", match_request_entity_1.MatchRequest)
], Match.prototype, "matchRequest", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => innings_entity_1.Innings, (innings) => innings.match),
    __metadata("design:type", Array)
], Match.prototype, "innings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ball_entity_1.Ball, (ball) => ball.match),
    __metadata("design:type", Array)
], Match.prototype, "balls", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => playing11_entity_1.Playing11, (playing11) => playing11.match),
    __metadata("design:type", Array)
], Match.prototype, "playing11", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_match_performance_entity_1.PlayerMatchPerformance, (performance) => performance.match),
    __metadata("design:type", Array)
], Match.prototype, "performances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_match_history_entity_1.TeamMatchHistory, (history) => history.match),
    __metadata("design:type", Array)
], Match.prototype, "teamHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => super_over_entity_1.SuperOver, (superOver) => superOver.match),
    __metadata("design:type", Array)
], Match.prototype, "superOvers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches'),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['teamAId']),
    (0, typeorm_1.Index)(['teamBId']),
    (0, typeorm_1.Index)(['matchRequestId'])
], Match);
//# sourceMappingURL=match.entity.js.map