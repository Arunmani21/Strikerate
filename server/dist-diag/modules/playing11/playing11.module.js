"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playing11Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const playing11_service_1 = require("./playing11.service");
const playing11_controller_1 = require("./playing11.controller");
const playing11_entity_1 = require("./playing11.entity");
const match_entity_1 = require("../match/match.entity");
const player_entity_1 = require("../player/player.entity");
const player_availability_entity_1 = require("../player/player-availability.entity");
const team_member_entity_1 = require("../team/team-member.entity");
const guest_player_entity_1 = require("../player/guest-player.entity");
const gateway_module_1 = require("../../gateway/gateway.module");
let Playing11Module = class Playing11Module {
};
exports.Playing11Module = Playing11Module;
exports.Playing11Module = Playing11Module = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                playing11_entity_1.Playing11,
                match_entity_1.Match,
                player_entity_1.Player,
                player_availability_entity_1.PlayerAvailability,
                team_member_entity_1.TeamMember,
                guest_player_entity_1.GuestPlayer,
            ]),
            gateway_module_1.GatewayModule,
        ],
        controllers: [playing11_controller_1.Playing11Controller],
        providers: [playing11_service_1.Playing11Service],
        exports: [playing11_service_1.Playing11Service],
    })
], Playing11Module);
//# sourceMappingURL=playing11.module.js.map