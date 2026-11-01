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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchPermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("../modules/match/match.entity");
const team_member_entity_1 = require("../modules/team/team-member.entity");
const team_roles_1 = require("../modules/team/team-roles");
let MatchPermissionService = class MatchPermissionService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async canManage(matchId, userId) {
        const match = await this.dataSource
            .getRepository(match_entity_1.Match)
            .findOne({ where: { id: matchId } });
        if (!match)
            return false;
        const membership = await this.dataSource
            .getRepository(team_member_entity_1.TeamMember)
            .findOne({
            where: [
                { userId, teamId: match.teamAId },
                { userId, teamId: match.teamBId },
            ],
        });
        if (!membership)
            return false;
        return (membership.role === team_roles_1.TeamRole.CAPTAIN ||
            membership.role === team_roles_1.TeamRole.VICE_CAPTAIN);
    }
    async assertCanManage(matchId, userId) {
        const allowed = await this.canManage(matchId, userId);
        if (!allowed) {
            throw new common_1.ForbiddenException('Only a captain or vice-captain of either team can perform this action');
        }
    }
};
exports.MatchPermissionService = MatchPermissionService;
exports.MatchPermissionService = MatchPermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], MatchPermissionService);
//# sourceMappingURL=match-permission.service.js.map