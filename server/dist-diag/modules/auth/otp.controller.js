"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const otp_service_1 = require("./otp.service");
const otp_dto_1 = require("./dto/otp.dto");
let OtpController = class OtpController {
    constructor(otpService) {
        this.otpService = otpService;
    }
    async sendOtp(dto) {
        const identifier = dto.identifier.trim();
        const isEmail = identifier.includes('@');
        if (!isEmail) {
            return this.otpService.generateMobileOtp(identifier);
        }
        else {
            return this.otpService.generateEmailOtp(identifier);
        }
    }
    async verifyOtp(dto) {
        const identifier = dto.identifier.trim();
        const otpType = dto.type || 'email_verification';
        return this.otpService.verifyOtp(identifier, dto.otp, otpType);
    }
    async resendOtp(dto) {
        const identifier = dto.identifier.trim();
        const otpType = dto.type || 'email_verification';
        return this.otpService.resendOtp(identifier, otpType);
    }
};
exports.OtpController = OtpController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send OTP for verification',
        description: `
    Send a One-Time Password (OTP) to email or mobile for verification.

    **Use Cases:**
    - Email verification after registration
    - Mobile number verification
    - Password reset requests

    **Parameters:**
    - identifier: Email address or mobile number
    - type: Type of OTP (email_verification, mobile_verification, password_reset)

    **OTP Details:**
    - 6-digit numeric code
    - Valid for 10 minutes
    - Maximum 3 attempts
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP sent successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    message: 'OTP sent successfully to your email',
                },
                timestamp: '2026-04-07T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid identifier',
    }),
    (0, swagger_1.ApiBody)({ type: otp_dto_1.SendOtpDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [otp_dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify OTP code',
        description: `
    Verify the OTP code sent to email or mobile.

    **Process:**
    - Validates OTP code
    - Checks expiration (10 minutes)
    - Tracks attempts (max 3)
    - Marks as verified on success

    **Security:**
    - OTP case-insensitive
    - Automatic expiry after max attempts
    - Time-based expiration
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP verified successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    message: 'OTP verified successfully',
                    userId: 'user-uuid-here',
                },
                timestamp: '2026-04-07T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired OTP',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Maximum attempts exceeded',
    }),
    (0, swagger_1.ApiBody)({ type: otp_dto_1.VerifyOtpDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Resend OTP',
        description: `
    Resend OTP if the previous one expired or user didn't receive it.

    **Note:** A new OTP will be generated and the previous one will be invalidated.
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'New OTP sent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No previous OTP found',
    }),
    (0, swagger_1.ApiBody)({ type: otp_dto_1.ResendOtpDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [otp_dto_1.ResendOtpDto]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "resendOtp", null);
exports.OtpController = OtpController = __decorate([
    (0, swagger_1.ApiTags)('OTP Verification'),
    (0, common_1.Controller)('otp'),
    __metadata("design:paramtypes", [otp_service_1.OtpService])
], OtpController);
//# sourceMappingURL=otp.controller.js.map