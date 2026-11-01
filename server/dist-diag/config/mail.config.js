"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailConfig = void 0;
exports.mailConfig = {
    enabled: process.env.MAIL_ENABLED !== 'false',
    apiUrl: process.env.MAIL_API_URL || 'https://your-email-api.com/send',
    institution: process.env.MAIL_INSTITUTION || 'Cricket Scoring App',
    clientUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    devFallbackEmail: process.env.DEV_FALLBACK_EMAIL || 'dev@cricketapp.com',
    environment: process.env.NODE_ENV || 'development',
    getRecipientEmail(userEmail) {
        if (this.environment === 'development') {
            return this.devFallbackEmail;
        }
        return userEmail;
    },
    logEmail(details) {
        if (this.environment === 'development') {
            console.log('\n════════════════════════════════════════');
            console.log('📧 EMAIL SERVICE (Development Mode)');
            console.log('════════════════════════════════════════');
            console.log(`Original Recipient: ${details.originalRecipient}`);
            console.log(`Actual Recipient: ${details.actualRecipient}`);
            console.log(`Subject: ${details.subject}`);
            if (details.context) {
                console.log(`Context:`, details.context);
            }
            console.log('════════════════════════════════════════\n');
        }
    },
};
//# sourceMappingURL=mail.config.js.map