"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const stats_service_1 = require("./stats.service");
const stats_controller_1 = require("./stats.controller");
const player_match_performance_entity_1 = require("./player-match-performance.entity");
const player_career_stats_entity_1 = require("./player-career-stats.entity");
const team_match_history_entity_1 = require("./team-match-history.entity");
const match_entity_1 = require("../match/match.entity");
const innings_entity_1 = require("../innings/innings.entity");
const ball_entity_1 = require("../scoring/ball.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_entity_1 = require("../player/player.entity");
const match_permission_service_1 = require("../../common/match-permission.service");
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                player_match_performance_entity_1.PlayerMatchPerformance,
                player_career_stats_entity_1.PlayerCareerStats,
                team_match_history_entity_1.TeamMatchHistory,
                match_entity_1.Match,
                innings_entity_1.Innings,
                ball_entity_1.Ball,
                playing11_entity_1.Playing11,
                player_entity_1.Player,
            ]),
        ],
        controllers: [stats_controller_1.StatsController],
        providers: [stats_service_1.StatsService, match_permission_service_1.MatchPermissionService],
        exports: [stats_service_1.StatsService],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map