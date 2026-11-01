"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const health_controller_1 = require("./common/controllers/health.controller");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const team_module_1 = require("./modules/team/team.module");
const player_module_1 = require("./modules/player/player.module");
const availability_module_1 = require("./modules/availability/availability.module");
const match_module_1 = require("./modules/match/match.module");
const playing11_module_1 = require("./modules/playing11/playing11.module");
const innings_module_1 = require("./modules/innings/innings.module");
const scoring_module_1 = require("./modules/scoring/scoring.module");
const stats_module_1 = require("./modules/stats/stats.module");
const gateway_module_1 = require("./gateway/gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default],
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    ...configService.get('database'),
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            team_module_1.TeamModule,
            player_module_1.PlayerModule,
            availability_module_1.AvailabilityModule,
            match_module_1.MatchModule,
            playing11_module_1.Playing11Module,
            innings_module_1.InningsModule,
            scoring_module_1.ScoringModule,
            stats_module_1.StatsModule,
            gateway_module_1.GatewayModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map