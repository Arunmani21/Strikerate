"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const handlebars = __importStar(require("handlebars"));
const mail_config_1 = require("../../config/mail.config");
let EmailService = class EmailService {
    async sendMail(userEmail, subject, htmlContent, context = {}) {
        try {
            if (!mail_config_1.mailConfig.enabled) {
                console.log('[MAIL] Email sending is disabled');
                return { success: false, reason: 'disabled' };
            }
            const actualRecipient = mail_config_1.mailConfig.getRecipientEmail(userEmail);
            mail_config_1.mailConfig.logEmail({
                originalRecipient: userEmail,
                actualRecipient: actualRecipient,
                subject: subject,
                context: context,
            });
            const bodyData = {
                institution: mail_config_1.mailConfig.institution,
                subject: subject,
                type: 'general',
                message: htmlContent,
                mail_to: [actualRecipient],
            };
            try {
                const response = await axios_1.default.post(mail_config_1.mailConfig.apiUrl, bodyData, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (response.data) {
                    console.log('[MAIL] Email sent successfully');
                    return { success: true, response: response.data };
                }
                else {
                    return { success: false, response: null };
                }
            }
            catch (requestError) {
                console.log('[MAIL] Error sending email:', requestError.message);
                return { success: false, error: requestError.message };
            }
        }
        catch (error) {
            console.log('[MAIL] Exception:', error);
            return { success: false, error: error };
        }
    }
    async sendOtpEmail(email, otp, userName) {
        try {
            const templatePath = path.join(__dirname, './templates/otp-verification.html');
            const source = fs.readFileSync(templatePath, 'utf-8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                userName: userName || 'Player',
                userEmail: email,
                otp: otp,
                clientUrl: mail_config_1.mailConfig.clientUrl,
                year: new Date().getFullYear(),
            };
            const htmlToSend = template(replacements);
            return await this.sendMail(email, 'Verify Your Email - Cricket Scoring App', htmlToSend, { userName: userName, otp: otp });
        }
        catch (error) {
            console.log('[MAIL] Error sending OTP email:', error);
            return { success: false, error: error };
        }
    }
    async sendWelcomeEmail(email, userName) {
        try {
            const templatePath = path.join(__dirname, './templates/welcome.html');
            const source = fs.readFileSync(templatePath, 'utf-8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                userName: userName || 'Player',
                userEmail: email,
                clientUrl: mail_config_1.mailConfig.clientUrl,
                year: new Date().getFullYear(),
            };
            const htmlToSend = template(replacements);
            return await this.sendMail(email, 'Welcome to Cricket Scoring App!', htmlToSend, { userName: userName });
        }
        catch (error) {
            console.log('[MAIL] Error sending welcome email:', error);
            return { success: false, error: error };
        }
    }
    async sendPasswordResetEmail(email, resetToken) {
        try {
            const resetUrl = `${mail_config_1.mailConfig.clientUrl}/reset-password?token=${resetToken}`;
            const templatePath = path.join(__dirname, './templates/password-reset.html');
            const source = fs.readFileSync(templatePath, 'utf-8').toString();
            const template = handlebars.compile(source);
            const replacements = {
                resetUrl: resetUrl,
                clientUrl: mail_config_1.mailConfig.clientUrl,
                year: new Date().getFullYear(),
            };
            const htmlToSend = template(replacements);
            return await this.sendMail(email, 'Reset Your Password - Cricket Scoring App', htmlToSend, { resetUrl: resetUrl });
        }
        catch (error) {
            console.log('[MAIL] Error sending password reset email:', error);
            return { success: false, error: error };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map