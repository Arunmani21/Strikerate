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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const user_profile_entity_1 = require("../user/user-profile.entity");
const otp_entity_1 = require("./otp.entity");
const bcrypt = __importStar(require("bcrypt"));
const otp_service_1 = require("./otp.service");
const email_service_1 = require("./email.service");
let AuthService = class AuthService {
    constructor(dataSource, jwtService, otpService, emailService) {
        this.dataSource = dataSource;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.emailService = emailService;
    }
    async register(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userRepository = queryRunner.manager.getRepository(user_entity_1.User);
            const profileRepository = queryRunner.manager.getRepository(user_profile_entity_1.UserProfile);
            const trimmedName = dto.name.trim();
            const trimmedEmail = dto.email.trim().toLowerCase();
            if (trimmedName !== dto.name || trimmedEmail !== dto.email) {
                throw new common_1.BadRequestException('Name and email should not have leading/trailing spaces');
            }
            const existingUser = await userRepository.findOne({
                where: { email: trimmedEmail },
            });
            if (existingUser) {
                throw new common_1.ConflictException('An account with this email already exists');
            }
            this.validatePasswordStrength(dto.password);
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const user = userRepository.create({
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
                emailVerified: false,
            });
            const savedUser = await userRepository.save(user);
            const profile = profileRepository.create({
                userId: savedUser.id,
                role: dto.role,
                battingStyle: dto.battingStyle,
                bowlingStyle: dto.bowlingStyle,
                experienceYears: dto.experienceYears,
                bio: dto.bio?.trim(),
            });
            await profileRepository.save(profile);
            await queryRunner.commitTransaction();
            this.otpService.generateEmailOtp(savedUser.email, savedUser.id).catch(err => {
                console.error('Failed to send OTP email:', err.message);
            });
            const { password, ...userWithoutPassword } = savedUser;
            return {
                ...userWithoutPassword,
                message: 'Registration successful. Please verify your email to activate your account.',
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
    async login(dto) {
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
        const trimmedEmail = dto.email.trim().toLowerCase();
        if (trimmedEmail !== dto.email.trim()) {
            throw new common_1.BadRequestException('Email should not have leading/trailing spaces');
        }
        const user = await userRepository.findOne({
            where: { email: trimmedEmail },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        };
    }
    async getMe(userId) {
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async verifyEmailOTP(email, otp) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userRepository = queryRunner.manager.getRepository(user_entity_1.User);
            const otpResult = await this.otpService.verifyOtp(email, otp, otp_entity_1.OtpType.EMAIL_VERIFICATION);
            if (!otpResult.success) {
                await queryRunner.rollbackTransaction();
                return otpResult;
            }
            const user = await userRepository.findOne({
                where: { email },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            user.emailVerified = true;
            user.emailVerifiedAt = new Date();
            await userRepository.save(user);
            await queryRunner.commitTransaction();
            this.emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
                console.error('Failed to send welcome email:', err.message);
            });
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Email verified successfully',
                user: userWithoutPassword,
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
    async resendOTP(email) {
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
        const user = await userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        return this.otpService.resendOtp(email, otp_entity_1.OtpType.EMAIL_VERIFICATION);
    }
    validatePasswordStrength(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            throw new common_1.BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }
        const commonPasswords = [
            'password',
            'password123',
            '12345678',
            'qwerty123',
            'abc12345',
            'letmein',
            'welcome1',
        ];
        if (commonPasswords.includes(password.toLowerCase())) {
            throw new common_1.BadRequestException('Please choose a stronger password. This password is too common.');
        }
        const hasSequence = /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
        if (hasSequence) {
            throw new common_1.BadRequestException('Password should not contain common sequences like "123" or "abc"');
        }
        const hasRepeatedChars = /(.)\1{2,}/.test(password);
        if (hasRepeatedChars) {
            throw new common_1.BadRequestException('Password should not contain repeated characters');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map