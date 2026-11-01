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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyMobileDto = exports.VerifyEmailDto = exports.ResendOtpDto = exports.VerifyOtpDto = exports.SendOtpDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendOtpDto {
}
exports.SendOtpDto = SendOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address or mobile number',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'OTP type',
        enum: ['email_verification', 'mobile_verification', 'password_reset'],
        example: 'email_verification',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "type", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address or mobile number',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit OTP code',
        example: '123456',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6),
    (0, class_validator_1.Matches)(/^\d+$/, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'OTP type',
        enum: ['email_verification', 'mobile_verification', 'password_reset'],
        example: 'email_verification',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "type", void 0);
class ResendOtpDto {
}
exports.ResendOtpDto = ResendOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address or mobile number',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResendOtpDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'OTP type',
        enum: ['email_verification', 'mobile_verification'],
        example: 'email_verification',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResendOtpDto.prototype, "type", void 0);
class VerifyEmailDto {
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit OTP code',
        example: '123456',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6),
    (0, class_validator_1.Matches)(/^\d+$/, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "otp", void 0);
class VerifyMobileDto {
}
exports.VerifyMobileDto = VerifyMobileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mobile number',
        example: '+1234567890',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], VerifyMobileDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit OTP code',
        example: '123456',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6),
    (0, class_validator_1.Matches)(/^\d+$/, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], VerifyMobileDto.prototype, "otp", void 0);
//# sourceMappingURL=otp.dto.js.map