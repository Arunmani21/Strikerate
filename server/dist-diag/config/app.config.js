"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
        secret: process.env.JWT_SECRET || 'strikerate_secret_key_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
}));
//# sourceMappingURL=app.config.js.map