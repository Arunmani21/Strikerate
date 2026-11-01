"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InningsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const innings_service_1 = require("./innings.service");
const innings_controller_1 = require("./innings.controller");
const innings_entity_1 = require("./innings.entity");
const match_entity_1 = require("../match/match.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_entity_1 = require("../player/player.entity");
let InningsModule = class InningsModule {
};
exports.InningsModule = InningsModule;
exports.InningsModule = InningsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([innings_entity_1.Innings, match_entity_1.Match, playing11_entity_1.Playing11, player_entity_1.Player]),
        ],
        controllers: [innings_controller_1.InningsController],
        providers: [innings_service_1.InningsService],
        exports: [innings_service_1.InningsService],
    })
], InningsModule);
//# sourceMappingURL=innings.module.js.map