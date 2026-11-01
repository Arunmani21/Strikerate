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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("./team.entity");
const team_member_entity_1 = require("./team-member.entity");
const team_roles_1 = require("./team-roles");
let TeamService = class TeamService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async createTeam(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const existingTeam = await teamRepository.findOne({
                where: { name: dto.name },
            });
            if (existingTeam) {
                throw new common_1.ConflictException('Team name already exists');
            }
            const team = teamRepository.create({
                name: dto.name,
                captainId: userId,
                createdBy: userId,
            });
            const savedTeam = await teamRepository.save(team);
            const teamMember = teamMemberRepository.create({
                teamId: savedTeam.id,
                userId: userId,
                role: team_roles_1.TeamRole.CAPTAIN,
            });
            await teamMemberRepository.save(teamMember);
            await queryRunner.commitTransaction();
            return savedTeam;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTeam(teamId) {
        const teamRepository = this.dataSource.getRepository(team_entity_1.Team);
        const team = await teamRepository.findOne({
            where: { id: teamId },
        });
        if (!team) {
            throw new common_1.NotFoundException('Team not found');
        }
        return team;
    }
    async getMyTeams(userId) {
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        const teamMembers = await teamMemberRepository.find({
            where: { userId },
            relations: ['team'],
        });
        return teamMembers
            .map((tm) => tm.team)
            .filter((team) => team !== null);
    }
    async transferCaptaincy(teamId, currentCaptainId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const team = await teamRepository.findOne({
                where: { id: teamId },
            });
            if (!team) {
                throw new common_1.NotFoundException('Team not found');
            }
            if (team.captainId !== currentCaptainId) {
                throw new common_1.BadRequestException('Only current captain can transfer captaincy');
            }
            const newCaptainMember = await teamMemberRepository.findOne({
                where: { teamId, userId: dto.userId },
            });
            if (!newCaptainMember) {
                throw new common_1.NotFoundException('User is not a member of this team');
            }
            const oldCaptainMember = await teamMemberRepository.findOne({
                where: { teamId, userId: currentCaptainId },
            });
            if (oldCaptainMember) {
                oldCaptainMember.role = team_roles_1.TeamRole.PLAYER;
                await teamMemberRepository.save(oldCaptainMember);
            }
            newCaptainMember.role = team_roles_1.TeamRole.CAPTAIN;
            await teamMemberRepository.save(newCaptainMember);
            team.captainId = dto.userId;
            await teamRepository.save(team);
            await queryRunner.commitTransaction();
            return team;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async assignViceCaptain(teamId, captainId, dto) {
        return this.assignRole(teamId, captainId, dto.userId, team_roles_1.TeamRole.VICE_CAPTAIN);
    }
    async assignRole(teamId, captainId, targetUserId, role) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const team = await teamRepository.findOne({
                where: { id: teamId },
            });
            if (!team) {
                throw new common_1.NotFoundException('Team not found');
            }
            if (team.captainId !== captainId) {
                throw new common_1.BadRequestException('Only captain can assign roles');
            }
            const targetMember = await teamMemberRepository.findOne({
                where: { teamId, userId: targetUserId },
            });
            if (!targetMember) {
                throw new common_1.NotFoundException('User is not a member of this team');
            }
            const existingRoleHolder = await teamMemberRepository.findOne({
                where: { teamId, role },
            });
            if (existingRoleHolder) {
                existingRoleHolder.role = team_roles_1.TeamRole.PLAYER;
                await teamMemberRepository.save(existingRoleHolder);
            }
            targetMember.role = role;
            await teamMemberRepository.save(targetMember);
            await queryRunner.commitTransaction();
            return targetMember;
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
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TeamService);
//# sourceMappingURL=team.service.js.map