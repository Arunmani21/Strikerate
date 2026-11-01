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
exports.Otp = exports.OtpStatus = exports.OtpType = void 0;
const typeorm_1 = require("typeorm");
var OtpType;
(function (OtpType) {
    OtpType["EMAIL_VERIFICATION"] = "email_verification";
    OtpType["PASSWORD_RESET"] = "password_reset";
    OtpType["MOBILE_VERIFICATION"] = "mobile_verification";
})(OtpType || (exports.OtpType = OtpType = {}));
var OtpStatus;
(function (OtpStatus) {
    OtpStatus["PENDING"] = "pending";
    OtpStatus["VERIFIED"] = "verified";
    OtpStatus["EXPIRED"] = "expired";
    OtpStatus["USED"] = "used";
})(OtpStatus || (exports.OtpStatus = OtpStatus = {}));
let Otp = class Otp {
};
exports.Otp = Otp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Otp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], Otp.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', nullable: true }),
    __metadata("design:type", String)
], Otp.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', nullable: true }),
    __metadata("design:type", String)
], Otp.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Otp.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OtpType,
        default: OtpType.EMAIL_VERIFICATION,
    }),
    __metadata("design:type", String)
], Otp.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OtpStatus,
        default: OtpStatus.PENDING,
    }),
    __metadata("design:type", String)
], Otp.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at' }),
    __metadata("design:type", Date)
], Otp.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verified_at', nullable: true }),
    __metadata("design:type", Date)
], Otp.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attempts', default: 0 }),
    __metadata("design:type", Number)
], Otp.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_attempts', default: 3 }),
    __metadata("design:type", Number)
], Otp.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Otp.prototype, "createdAt", void 0);
exports.Otp = Otp = __decorate([
    (0, typeorm_1.Entity)('otps'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['mobile']),
    (0, typeorm_1.Index)(['otp']),
    (0, typeorm_1.Index)(['type'])
], Otp);
//# sourceMappingURL=otp.entity.js.map