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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const otp_entity_1 = require("./otp.entity");
const email_service_1 = require("./email.service");
const otp_utils_1 = require("../utils/otp.utils");
let OtpService = class OtpService {
    constructor(dataSource, emailService) {
        this.dataSource = dataSource;
        this.emailService = emailService;
    }
    async generateEmailOtp(email, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const otpRepository = queryRunner.manager.getRepository(otp_entity_1.Otp);
            await otpRepository.update({ email, status: otp_entity_1.OtpStatus.PENDING }, { status: otp_entity_1.OtpStatus.EXPIRED });
            const otpCode = (0, otp_utils_1.generateOtp)();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const otp = otpRepository.create({
                email,
                userId,
                otp: otpCode,
                type: otp_entity_1.OtpType.EMAIL_VERIFICATION,
                status: otp_entity_1.OtpStatus.PENDING,
                expiresAt,
            });
            await otpRepository.save(otp);
            await queryRunner.commitTransaction();
            await this.emailService.sendOtpEmail(email, otpCode);
            return {
                success: true,
                message: 'OTP sent successfully to your email',
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async generateMobileOtp(mobile, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const otpRepository = queryRunner.manager.getRepository(otp_entity_1.Otp);
            await otpRepository.update({ mobile, status: otp_entity_1.OtpStatus.PENDING }, { status: otp_entity_1.OtpStatus.EXPIRED });
            const otpCode = (0, otp_utils_1.generateOtp)();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const otp = otpRepository.create({
                mobile,
                userId,
                otp: otpCode,
                type: otp_entity_1.OtpType.MOBILE_VERIFICATION,
                status: otp_entity_1.OtpStatus.PENDING,
                expiresAt,
            });
            await otpRepository.save(otp);
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: 'OTP sent successfully to your mobile',
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async verifyOtp(identifier, otpCode, type = otp_entity_1.OtpType.EMAIL_VERIFICATION) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const otpRepository = queryRunner.manager.getRepository(otp_entity_1.Otp);
            const otp = await otpRepository.findOne({
                where: [
                    { email: identifier, otp: otpCode, type, status: otp_entity_1.OtpStatus.PENDING },
                    { mobile: identifier, otp: otpCode, type, status: otp_entity_1.OtpStatus.PENDING },
                ],
                order: { createdAt: 'DESC' },
            });
            if (!otp) {
                await otpRepository.update([
                    { email: identifier, type, status: otp_entity_1.OtpStatus.PENDING },
                    { mobile: identifier, type, status: otp_entity_1.OtpStatus.PENDING },
                ], { attempts: () => 'attempts + 1' });
                throw new common_1.UnauthorizedException('Invalid or expired OTP');
            }
            if ((0, otp_utils_1.isOtpExpired)(otp.expiresAt)) {
                otp.status = otp_entity_1.OtpStatus.EXPIRED;
                await otpRepository.save(otp);
                await queryRunner.commitTransaction();
                throw new common_1.UnauthorizedException('OTP has expired. Please request a new one.');
            }
            if (otp.attempts >= otp.maxAttempts) {
                otp.status = otp_entity_1.OtpStatus.EXPIRED;
                await otpRepository.save(otp);
                await queryRunner.commitTransaction();
                throw new common_1.BadRequestException('Maximum OTP attempts exceeded. Please request a new one.');
            }
            otp.attempts += 1;
            if (otp.otp.toLowerCase() !== otpCode.toLowerCase()) {
                await otpRepository.save(otp);
                await queryRunner.commitTransaction();
                const remainingAttempts = otp.maxAttempts - otp.attempts;
                throw new common_1.UnauthorizedException(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
            }
            otp.status = otp_entity_1.OtpStatus.VERIFIED;
            otp.verifiedAt = new Date();
            await otpRepository.save(otp);
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: 'OTP verified successfully',
                userId: otp.userId,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async resendOtp(identifier, type = otp_entity_1.OtpType.EMAIL_VERIFICATION) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const otpRepository = queryRunner.manager.getRepository(otp_entity_1.Otp);
            const recentOtp = await otpRepository.findOne({
                where: [
                    { email: identifier, type },
                    { mobile: identifier, type },
                ],
                order: { createdAt: 'DESC' },
            });
            if (!recentOtp) {
                throw new common_1.NotFoundException('No previous OTP found. Please register first.');
            }
            if (type === otp_entity_1.OtpType.EMAIL_VERIFICATION) {
                await this.generateEmailOtp(identifier, recentOtp.userId);
            }
            else if (type === otp_entity_1.OtpType.MOBILE_VERIFICATION) {
                await this.generateMobileOtp(identifier, recentOtp.userId);
            }
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: 'New OTP sent successfully',
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cleanupExpiredOtps() {
        const otpRepository = this.dataSource.getRepository(otp_entity_1.Otp);
        const now = new Date();
        await otpRepository
            .createQueryBuilder()
            .update()
            .set({ status: otp_entity_1.OtpStatus.EXPIRED })
            .where('expiresAt < :now', { now })
            .andWhere('status = :pending', { pending: otp_entity_1.OtpStatus.PENDING })
            .execute();
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        email_service_1.EmailService])
], OtpService);
//# sourceMappingURL=otp.service.js.map