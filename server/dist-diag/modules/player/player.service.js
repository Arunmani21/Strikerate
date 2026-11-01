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
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_entity_1 = require("./player.entity");
const player_availability_entity_1 = require("./player-availability.entity");
const team_member_entity_1 = require("../team/team-member.entity");
const team_roles_1 = require("../team/team-roles");
let PlayerService = class PlayerService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async addPlayer(teamId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const existingPlayer = await playerRepository.findOne({
                where: { name: dto.name, teamId },
            });
            if (existingPlayer) {
                throw new common_1.ConflictException(`Player '${dto.name}' already exists in this team`);
            }
            if (dto.userId) {
                const existingTeamMember = await teamMemberRepository.findOne({
                    where: { userId: dto.userId, teamId },
                });
                if (existingTeamMember) {
                    throw new common_1.ConflictException('User is already a member of this team');
                }
                const teamMember = teamMemberRepository.create({
                    teamId,
                    userId: dto.userId,
                    role: team_roles_1.TeamRole.PLAYER,
                });
                await teamMemberRepository.save(teamMember);
            }
            const player = playerRepository.create({
                teamId,
                name: dto.name.trim(),
                jerseyNumber: dto.jerseyNumber,
                userId: dto.userId,
            });
            const savedPlayer = await playerRepository.save(player);
            await queryRunner.commitTransaction();
            return savedPlayer;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async removePlayer(teamId, playerId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const player = await playerRepository.findOne({
                where: { id: playerId, teamId },
            });
            if (!player) {
                throw new common_1.NotFoundException('Player not found in this team');
            }
            await playerRepository.remove(player);
            await queryRunner.commitTransaction();
            return { message: 'Player removed successfully' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTeamPlayers(teamId) {
        const playerRepository = this.dataSource.getRepository(player_entity_1.Player);
        const players = await playerRepository.find({
            where: { teamId },
            order: { name: 'ASC' },
        });
        return players;
    }
    async getAvailablePlayers(teamId, date) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const availabilityRepository = queryRunner.manager.getRepository(player_availability_entity_1.PlayerAvailability);
            const availableDate = new Date(date);
            const players = await playerRepository.find({
                where: { teamId },
            });
            const playerIds = players.map((p) => p.id);
            const availabilities = await availabilityRepository.find({
                where: {
                    playerId: (0, typeorm_2.In)(playerIds),
                    availableDate,
                },
            });
            const availabilityMap = new Map();
            availabilities.forEach((av) => {
                availabilityMap.set(av.playerId, av.isAvailable);
            });
            const playersWithAvailability = players.map((player) => ({
                ...player,
                isAvailable: availabilityMap.has(player.id)
                    ? availabilityMap.get(player.id)
                    : true,
            }));
            const availablePlayers = playersWithAvailability.filter((p) => p.isAvailable);
            return availablePlayers;
        }
        finally {
            await queryRunner.release();
        }
    }
    async setPlayerAvailability(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const availabilityRepository = queryRunner.manager.getRepository(player_availability_entity_1.PlayerAvailability);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const player = await playerRepository.findOne({
                where: { id: dto.playerId },
            });
            if (!player) {
                throw new common_1.NotFoundException('Player not found');
            }
            const isOwner = player.userId === userId;
            let hasTeamPermission = false;
            if (!isOwner) {
                const teamMember = await teamMemberRepository.findOne({
                    where: { userId, teamId: player.teamId },
                });
                if (teamMember && (teamMember.role === team_roles_1.TeamRole.CAPTAIN || teamMember.role === team_roles_1.TeamRole.VICE_CAPTAIN)) {
                    hasTeamPermission = true;
                }
            }
            if (!isOwner && !hasTeamPermission) {
                throw new common_1.BadRequestException('You can only set availability for yourself or your team members (if captain/manager)');
            }
            const existingAvailability = await availabilityRepository.findOne({
                where: {
                    playerId: dto.playerId,
                    availableDate: new Date(dto.availableDate),
                },
            });
            if (existingAvailability) {
                Object.assign(existingAvailability, {
                    isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : existingAvailability.isAvailable,
                    reason: dto.reason !== undefined ? dto.reason : existingAvailability.reason,
                });
                await availabilityRepository.save(existingAvailability);
            }
            else {
                const availability = availabilityRepository.create({
                    playerId: dto.playerId,
                    userId,
                    availableDate: new Date(dto.availableDate),
                    isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
                    reason: dto.reason,
                });
                await availabilityRepository.save(availability);
            }
            await queryRunner.commitTransaction();
            return {
                message: 'Player availability updated successfully',
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
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PlayerService);
//# sourceMappingURL=player.service.js.map