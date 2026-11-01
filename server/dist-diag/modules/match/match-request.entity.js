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
exports.MatchRequest = exports.MatchRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
const match_entity_1 = require("./match.entity");
var MatchRequestStatus;
(function (MatchRequestStatus) {
    MatchRequestStatus["PENDING"] = "pending";
    MatchRequestStatus["CONFIRMED"] = "confirmed";
    MatchRequestStatus["REJECTED"] = "rejected";
    MatchRequestStatus["CANCELLED"] = "cancelled";
})(MatchRequestStatus || (exports.MatchRequestStatus = MatchRequestStatus = {}));
let MatchRequest = class MatchRequest {
};
exports.MatchRequest = MatchRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MatchRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_date', type: 'date' }),
    __metadata("design:type", Date)
], MatchRequest.prototype, "matchDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_time', type: 'time' }),
    __metadata("design:type", String)
], MatchRequest.prototype, "matchTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MatchRequest.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_overs', nullable: true, type: 'integer' }),
    __metadata("design:type", Number)
], MatchRequest.prototype, "preferredOvers", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MatchRequestStatus,
        default: MatchRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], MatchRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responded_at', nullable: true }),
    __metadata("design:type", Date)
], MatchRequest.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requesting_team_id', nullable: false }),
    __metadata("design:type", String)
], MatchRequest.prototype, "requestingTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.sentRequests),
    (0, typeorm_1.JoinColumn)({ name: 'requesting_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], MatchRequest.prototype, "requestingTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opponent_team_id', nullable: false }),
    __metadata("design:type", String)
], MatchRequest.prototype, "opponentTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.receivedRequests),
    (0, typeorm_1.JoinColumn)({ name: 'opponent_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], MatchRequest.prototype, "opponentTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by', nullable: false }),
    __metadata("design:type", String)
], MatchRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responded_by', nullable: true }),
    __metadata("design:type", String)
], MatchRequest.prototype, "respondedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (match) => match.matchRequest),
    __metadata("design:type", Array)
], MatchRequest.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MatchRequest.prototype, "createdAt", void 0);
exports.MatchRequest = MatchRequest = __decorate([
    (0, typeorm_1.Entity)('match_requests'),
    (0, typeorm_1.Index)(['requestingTeamId']),
    (0, typeorm_1.Index)(['opponentTeamId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['matchDate'])
], MatchRequest);
//# sourceMappingURL=match-request.entity.js.map