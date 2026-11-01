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
exports.TeamAvailability = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
let TeamAvailability = class TeamAvailability {
};
exports.TeamAvailability = TeamAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TeamAvailability.prototype, "availableDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_from', type: 'time', nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "availableFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_until', type: 'time', nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "availableUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], TeamAvailability.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_overs', nullable: true, type: 'integer' }),
    __metadata("design:type", Number)
], TeamAvailability.prototype, "preferredOvers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_open', default: true }),
    __metadata("design:type", Boolean)
], TeamAvailability.prototype, "isOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TeamAvailability.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', nullable: false }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.availabilities, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamAvailability.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'posted_by', nullable: false }),
    __metadata("design:type", String)
], TeamAvailability.prototype, "postedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamAvailability.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TeamAvailability.prototype, "updatedAt", void 0);
exports.TeamAvailability = TeamAvailability = __decorate([
    (0, typeorm_1.Entity)('team_availability'),
    (0, typeorm_1.Index)(['teamId']),
    (0, typeorm_1.Index)(['matchId']),
    (0, typeorm_1.Index)(['userId'])
], TeamAvailability);
//# sourceMappingURL=team-availability.entity.js.map