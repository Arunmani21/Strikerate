"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const match_service_1 = require("./match.service");
const match_controller_1 = require("./match.controller");
const match_status_service_1 = require("./match-status.service");
const match_status_controller_1 = require("./match-status.controller");
const super_over_service_1 = require("./super-over.service");
const super_over_controller_1 = require("./super-over.controller");
const team_availability_controller_1 = require("./team-availability.controller");
const match_request_controller_1 = require("./match-request.controller");
const toss_controller_1 = require("./toss.controller");
const team_matches_controller_1 = require("./team-matches.controller");
const match_entity_1 = require("./match.entity");
const match_request_entity_1 = require("./match-request.entity");
const team_availability_entity_1 = require("./team-availability.entity");
const super_over_entity_1 = require("./super-over.entity");
const team_entity_1 = require("../team/team.entity");
const team_member_entity_1 = require("../team/team-member.entity");
const match_permission_service_1 = require("../../common/match-permission.service");
const gateway_module_1 = require("../../gateway/gateway.module");
let MatchModule = class MatchModule {
};
exports.MatchModule = MatchModule;
exports.MatchModule = MatchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                match_entity_1.Match,
                match_request_entity_1.MatchRequest,
                team_availability_entity_1.TeamAvailability,
                super_over_entity_1.SuperOver,
                team_entity_1.Team,
                team_member_entity_1.TeamMember,
            ]),
            gateway_module_1.GatewayModule,
        ],
        controllers: [
            match_controller_1.MatchController,
            match_status_controller_1.MatchStatusController,
            super_over_controller_1.SuperOverController,
            team_availability_controller_1.TeamAvailabilityController,
            match_request_controller_1.MatchRequestController,
            toss_controller_1.TossController,
            team_matches_controller_1.TeamMatchesController,
        ],
        providers: [match_service_1.MatchService, match_status_service_1.MatchStatusService, super_over_service_1.SuperOverService, match_permission_service_1.MatchPermissionService],
        exports: [match_service_1.MatchService, match_status_service_1.MatchStatusService, super_over_service_1.SuperOverService, match_permission_service_1.MatchPermissionService],
    })
], MatchModule);
//# sourceMappingURL=match.module.js.map