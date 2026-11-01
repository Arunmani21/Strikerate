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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_profile_entity_1 = require("./user-profile.entity");
let UserService = class UserService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async createProfile(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const profileRepository = queryRunner.manager.getRepository(user_profile_entity_1.UserProfile);
            const existingProfile = await profileRepository.findOne({
                where: { userId },
            });
            if (existingProfile) {
                throw new common_1.BadRequestException('Profile already exists. Use PATCH to update.');
            }
            this.validateProfileInput(dto);
            const processedDto = {
                ...dto,
                bio: dto.bio?.trim(),
            };
            const profile = profileRepository.create({
                userId,
                ...processedDto,
            });
            const savedProfile = await profileRepository.save(profile);
            await queryRunner.commitTransaction();
            return savedProfile;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateProfile(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const profileRepository = queryRunner.manager.getRepository(user_profile_entity_1.UserProfile);
            const profile = await profileRepository.findOne({
                where: { userId },
            });
            if (!profile) {
                throw new common_1.NotFoundException('Profile not found');
            }
            this.validateProfileInput(dto);
            const processedDto = {
                ...dto,
                bio: dto.bio?.trim(),
            };
            Object.assign(profile, processedDto);
            const savedProfile = await profileRepository.save(profile);
            await queryRunner.commitTransaction();
            return savedProfile;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getProfile(userId) {
        const profileRepository = this.dataSource.getRepository(user_profile_entity_1.UserProfile);
        const profile = await profileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    validateProfileInput(dto) {
        if (dto.role && dto.battingStyle && dto.bowlingStyle) {
            if (dto.role === 'batsman' && dto.bowlingStyle) {
                throw new common_1.BadRequestException('Batsman should not have a bowling style');
            }
            if (dto.role === 'bowler' && dto.battingStyle) {
                throw new common_1.BadRequestException('Bowler should not have a batting style');
            }
        }
        if (dto.experienceYears !== undefined && dto.experienceYears < 0) {
            throw new common_1.BadRequestException('Experience years cannot be negative');
        }
        if (dto.bio && dto.bio.trim().length === 0) {
            throw new common_1.BadRequestException('Bio cannot be empty or just whitespace');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], UserService);
//# sourceMappingURL=user.service.js.map