"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const team_controller_1 = require("./team.controller");
const team_service_1 = require("./team.service");
const team_management_controller_1 = require("./team-management.controller");
const team_management_service_1 = require("./team-management.service");
const team_permission_guard_1 = require("./team-permission.guard");
const team_entity_1 = require("./team.entity");
const team_member_entity_1 = require("./team-member.entity");
const team_availability_entity_1 = require("../match/team-availability.entity");
let TeamModule = class TeamModule {
};
exports.TeamModule = TeamModule;
exports.TeamModule = TeamModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([team_entity_1.Team, team_member_entity_1.TeamMember, team_availability_entity_1.TeamAvailability])],
        controllers: [team_controller_1.TeamController, team_management_controller_1.TeamManagementController],
        providers: [team_service_1.TeamService, team_management_service_1.TeamManagementService, team_permission_guard_1.TeamPermissionGuard],
        exports: [team_service_1.TeamService, team_management_service_1.TeamManagementService, team_permission_guard_1.TeamPermissionGuard],
    })
], TeamModule);
//# sourceMappingURL=team.module.js.map