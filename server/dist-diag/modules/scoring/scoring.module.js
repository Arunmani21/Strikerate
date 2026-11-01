"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scoring_service_1 = require("./scoring.service");
const scoring_controller_1 = require("./scoring.controller");
const retire_hurt_service_1 = require("./retire-hurt.service");
const retire_hurt_controller_1 = require("./retire-hurt.controller");
const scorer_transfer_service_1 = require("./scorer-transfer.service");
const scorer_transfer_controller_1 = require("./scorer-transfer.controller");
const ball_entity_1 = require("./ball.entity");
const innings_entity_1 = require("../innings/innings.entity");
const match_entity_1 = require("../match/match.entity");
const player_entity_1 = require("../player/player.entity");
const player_match_performance_entity_1 = require("../stats/player-match-performance.entity");
const scorer_permission_entity_1 = require("./scorer-permission.entity");
const user_entity_1 = require("../user/user.entity");
const gateway_module_1 = require("../../gateway/gateway.module");
let ScoringModule = class ScoringModule {
};
exports.ScoringModule = ScoringModule;
exports.ScoringModule = ScoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([ball_entity_1.Ball, innings_entity_1.Innings, match_entity_1.Match, player_entity_1.Player, player_match_performance_entity_1.PlayerMatchPerformance, scorer_permission_entity_1.ScorerPermission, user_entity_1.User]),
            gateway_module_1.GatewayModule,
        ],
        controllers: [scoring_controller_1.ScoringController, retire_hurt_controller_1.RetireHurtController, scorer_transfer_controller_1.ScorerTransferController],
        providers: [scoring_service_1.ScoringService, retire_hurt_service_1.RetireHurtService, scorer_transfer_service_1.ScorerTransferService],
        exports: [scoring_service_1.ScoringService, retire_hurt_service_1.RetireHurtService, scorer_transfer_service_1.ScorerTransferService],
    })
], ScoringModule);
//# sourceMappingURL=scoring.module.js.map