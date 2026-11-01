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
exports.GuestPlayerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const guest_player_entity_1 = require("./guest-player.entity");
const player_entity_1 = require("./player.entity");
const user_entity_1 = require("../user/user.entity");
const user_profile_entity_1 = require("../user/user-profile.entity");
const bcrypt = __importStar(require("bcrypt"));
let GuestPlayerService = class GuestPlayerService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async addGuestPlayer(teamId, dto, addedBy, matchId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const guestPlayerRepository = queryRunner.manager.getRepository(guest_player_entity_1.GuestPlayer);
            if (dto.mobile || dto.email) {
                const existingGuest = await guestPlayerRepository.findOne({
                    where: [
                        { mobile: dto.mobile, teamId, status: 'active' },
                        { email: dto.email, teamId, status: 'active' },
                    ],
                });
                if (existingGuest) {
                    throw new common_1.ConflictException('A guest player with this mobile or email already exists in the team');
                }
            }
            const guestPlayer = guestPlayerRepository.create({
                teamId,
                matchId: matchId || null,
                name: dto.name,
                mobile: dto.mobile || null,
                email: dto.email || null,
                battingStyle: dto.battingStyle || null,
                bowlingStyle: dto.bowlingStyle || null,
                role: dto.role || null,
                metadata: dto.metadata || {},
                addedBy,
                status: 'active',
            });
            const savedGuest = await guestPlayerRepository.save(guestPlayer);
            await queryRunner.commitTransaction();
            return savedGuest;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTeamGuestPlayers(teamId) {
        const guestPlayerRepository = this.dataSource.getRepository(guest_player_entity_1.GuestPlayer);
        return await guestPlayerRepository.find({
            where: { teamId, status: 'active' },
            order: { createdAt: 'DESC' },
        });
    }
    async getGuestPlayer(id) {
        const guestPlayerRepository = this.dataSource.getRepository(guest_player_entity_1.GuestPlayer);
        const guestPlayer = await guestPlayerRepository.findOne({ where: { id } });
        if (!guestPlayer) {
            throw new common_1.NotFoundException('Guest player not found');
        }
        return guestPlayer;
    }
    async updateGuestPlayer(id, dto) {
        const guestPlayerRepository = this.dataSource.getRepository(guest_player_entity_1.GuestPlayer);
        const guestPlayer = await this.getGuestPlayer(id);
        if (guestPlayer.isConverted) {
            throw new common_1.BadRequestException('Cannot update a guest player who has been converted to a regular player');
        }
        Object.assign(guestPlayer, dto);
        return await guestPlayerRepository.save(guestPlayer);
    }
    async deactivateGuestPlayer(id) {
        const guestPlayerRepository = this.dataSource.getRepository(guest_player_entity_1.GuestPlayer);
        const guestPlayer = await this.getGuestPlayer(id);
        guestPlayer.status = 'inactive';
        await guestPlayerRepository.save(guestPlayer);
    }
    async convertGuestPlayer(guestPlayerId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const guestPlayerRepository = queryRunner.manager.getRepository(guest_player_entity_1.GuestPlayer);
            const userRepository = queryRunner.manager.getRepository(user_entity_1.User);
            const profileRepository = queryRunner.manager.getRepository(user_profile_entity_1.UserProfile);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const guestPlayer = await guestPlayerRepository.findOne({
                where: { id: guestPlayerId },
            });
            if (!guestPlayer) {
                throw new common_1.NotFoundException('Guest player not found');
            }
            if (guestPlayer.isConverted) {
                throw new common_1.BadRequestException('Guest player has already been converted');
            }
            const existingUser = await userRepository.findOne({
                where: { email: dto.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('An account with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const user = userRepository.create({
                name: guestPlayer.name,
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                mobile: dto.mobile || guestPlayer.mobile || null,
                emailVerified: false,
            });
            const savedUser = await userRepository.save(user);
            const profile = profileRepository.create();
            profile.userId = savedUser.id;
            profile.role = (guestPlayer.role || 'allrounder');
            profile.battingStyle = (guestPlayer.battingStyle || 'right_hand');
            profile.bowlingStyle = (guestPlayer.bowlingStyle || 'right_arm_fast');
            profile.experienceYears = 0;
            profile.bio = `Converted from guest player. ${guestPlayer.metadata?.notes || ''}`;
            await profileRepository.save(profile);
            const player = playerRepository.create({
                teamId: guestPlayer.teamId,
                userId: savedUser.id,
                name: guestPlayer.name,
                jerseyNumber: null,
                battingRuns: 0,
                battingBalls: 0,
                battingFours: 0,
                battingSixes: 0,
                battingStrikeRate: 0,
                bowlingBalls: 0,
                bowlingRuns: 0,
                bowlingWickets: 0,
                bowlingEconomy: 0,
                bowlingOvers: 0,
                isOut: false,
            });
            const savedPlayer = await playerRepository.save(player);
            guestPlayer.isConverted = true;
            guestPlayer.convertedPlayerId = savedPlayer.id;
            guestPlayer.status = 'inactive';
            await guestPlayerRepository.save(guestPlayer);
            await queryRunner.commitTransaction();
            return { user: savedUser, player: savedPlayer };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getMatchGuestPlayers(matchId) {
        const guestPlayerRepository = this.dataSource.getRepository(guest_player_entity_1.GuestPlayer);
        return await guestPlayerRepository.find({
            where: { matchId, status: 'active' },
            order: { createdAt: 'DESC' },
        });
    }
    async canPlayInMatch(guestPlayerId, matchId) {
        const guestPlayer = await this.getGuestPlayer(guestPlayerId);
        if (guestPlayer.status !== 'active') {
            return false;
        }
        if (guestPlayer.matchId && guestPlayer.matchId !== matchId) {
            return false;
        }
        return true;
    }
};
exports.GuestPlayerService = GuestPlayerService;
exports.GuestPlayerService = GuestPlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], GuestPlayerService);
//# sourceMappingURL=guest-player.service.js.map