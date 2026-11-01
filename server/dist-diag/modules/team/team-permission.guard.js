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
exports.TeamPermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_member_entity_1 = require("./team-member.entity");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let TeamPermissionGuard = class TeamPermissionGuard {
    constructor(dataSource, reflector) {
        this.dataSource = dataSource;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const teamId = request.params.teamId || request.params.id;
        if (!teamId) {
            throw new common_1.NotFoundException('Team ID not found in request');
        }
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        const teamMember = await teamMemberRepository.findOne({
            where: { teamId, userId },
        });
        if (!teamMember) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        if (!requiredRoles.includes(teamMember.role)) {
            throw new common_1.ForbiddenException(`You need ${requiredRoles.join(' or ')} role to perform this action`);
        }
        request.teamMember = teamMember;
        return true;
    }
};
exports.TeamPermissionGuard = TeamPermissionGuard;
exports.TeamPermissionGuard = TeamPermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        core_1.Reflector])
], TeamPermissionGuard);
//# sourceMappingURL=team-permission.guard.js.map