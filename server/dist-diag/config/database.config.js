"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const path_1 = require("path");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Arunme211',
    database: process.env.DB_NAME || 'strikerate_db',
    entities: [(0, path_1.join)(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
    synchronize: true,
    autoLoadEntities: true,
    logging: false,
}));
//# sourceMappingURL=database.config.js.map