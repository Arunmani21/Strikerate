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
exports.TeamMember = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("./team.entity");
const team_roles_1 = require("./team-roles");
const user_entity_1 = require("../user/user.entity");
let TeamMember = class TeamMember {
};
exports.TeamMember = TeamMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: team_roles_1.TeamRole,
        default: team_roles_1.TeamRole.PLAYER,
    }),
    __metadata("design:type", String)
], TeamMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], TeamMember.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jersey_number', nullable: true }),
    __metadata("design:type", Number)
], TeamMember.prototype, "jerseyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batting_style', nullable: true }),
    __metadata("design:type", String)
], TeamMember.prototype, "battingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bowling_style', nullable: true }),
    __metadata("design:type", String)
], TeamMember.prototype, "bowlingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player_type', default: 'all-rounder' }),
    __metadata("design:type", String)
], TeamMember.prototype, "playerType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'joined_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_updated_at', nullable: true }),
    __metadata("design:type", Date)
], TeamMember.prototype, "roleUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_updated_by', nullable: true }),
    __metadata("design:type", String)
], TeamMember.prototype, "roleUpdatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', nullable: false }),
    __metadata("design:type", String)
], TeamMember.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.members, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamMember.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", String)
], TeamMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.teamMembers, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TeamMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], TeamMember.prototype, "isActive", void 0);
exports.TeamMember = TeamMember = __decorate([
    (0, typeorm_1.Entity)('team_members'),
    (0, typeorm_1.Unique)(['teamId', 'userId']),
    (0, typeorm_1.Index)(['teamId', 'role']),
    (0, typeorm_1.Index)(['userId'])
], TeamMember);
//# sourceMappingURL=team-member.entity.js.map