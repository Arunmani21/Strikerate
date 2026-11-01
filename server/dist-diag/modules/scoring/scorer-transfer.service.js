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
exports.ScorerTransferService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scorer_permission_entity_1 = require("./scorer-permission.entity");
const user_entity_1 = require("../user/user.entity");
const match_entity_1 = require("../match/match.entity");
const team_member_entity_1 = require("../team/team-member.entity");
const team_roles_1 = require("../team/team-roles");
let ScorerTransferService = class ScorerTransferService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async transferScorer(matchId, fromUserId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const scorerPermissionRepository = queryRunner.manager.getRepository(scorer_permission_entity_1.ScorerPermission);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const userRepository = queryRunner.manager.getRepository(user_entity_1.User);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            const mayScore = await this.canUserScore(matchId, fromUserId);
            if (!mayScore) {
                throw new common_1.BadRequestException('You do not have active scoring permissions for this match');
            }
            const targetUser = await userRepository.findOne({
                where: { id: dto.transferToUserId },
            });
            if (!targetUser) {
                throw new common_1.NotFoundException('Target user not found');
            }
            const isTeamMember = await teamMemberRepository.findOne({
                where: [
                    { userId: dto.transferToUserId, teamId: match.teamAId },
                    { userId: dto.transferToUserId, teamId: match.teamBId },
                ],
            });
            if (!isTeamMember) {
                throw new common_1.BadRequestException('Target user must be a member of one of the teams playing this match');
            }
            const existingPermissions = await scorerPermissionRepository.findOne({
                where: {
                    matchId,
                    userId: dto.transferToUserId,
                    isActive: true,
                },
            });
            if (existingPermissions && existingPermissions.canScore) {
                throw new common_1.ConflictException('Target user already has active scoring permissions');
            }
            if (dto.revokeCurrentPermissions) {
                const transferorRow = await scorerPermissionRepository.findOne({
                    where: { matchId, userId: fromUserId, isActive: true },
                });
                if (transferorRow) {
                    transferorRow.isActive = false;
                    transferorRow.canScore = false;
                    await scorerPermissionRepository.save(transferorRow);
                }
            }
            const newPermission = scorerPermissionRepository.create({
                matchId,
                userId: dto.transferToUserId,
                role: dto.role || scorer_permission_entity_1.ScorerRole.PRIMARY_SCORER,
                isActive: false,
                canScore: false,
                transferredFrom: fromUserId,
                transferredTo: dto.transferToUserId,
                transferStatus: scorer_permission_entity_1.TransferStatus.PENDING,
                transferredAt: new Date(),
                transferReason: dto.reason,
                metadata: dto.metadata || {},
            });
            const savedPermission = await scorerPermissionRepository.save(newPermission);
            await queryRunner.commitTransaction();
            return {
                transfer: savedPermission,
                message: `Scoring permissions transferred to ${targetUser.name}. Waiting for acceptance.`,
            };
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async acceptScorerTransfer(transferId, acceptingUserId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const scorerPermissionRepository = queryRunner.manager.getRepository(scorer_permission_entity_1.ScorerPermission);
            const transfer = await scorerPermissionRepository.findOne({
                where: { id: transferId },
            });
            if (!transfer) {
                throw new common_1.NotFoundException('Transfer request not found');
            }
            if (transfer.userId !== acceptingUserId) {
                throw new common_1.BadRequestException('This transfer request is not for you');
            }
            if (transfer.transferStatus !== scorer_permission_entity_1.TransferStatus.PENDING) {
                throw new common_1.BadRequestException(`Transfer is ${transfer.transferStatus}, cannot accept`);
            }
            transfer.transferStatus = scorer_permission_entity_1.TransferStatus.ACCEPTED;
            transfer.acceptedAt = new Date();
            if (dto.activateImmediately) {
                transfer.isActive = true;
                transfer.canScore = true;
            }
            if (dto.notes) {
                transfer.metadata = {
                    ...transfer.metadata,
                    acceptanceNotes: dto.notes,
                };
            }
            transfer.updatedAt = new Date();
            const savedPermission = await scorerPermissionRepository.save(transfer);
            await queryRunner.commitTransaction();
            return {
                permission: savedPermission,
                message: dto.activateImmediately
                    ? 'Scoring permissions activated successfully. You can now score this match.'
                    : 'Transfer accepted. Scoring permissions will be activated by the transferor.',
            };
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async rejectScorerTransfer(transferId, rejectingUserId, dto) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        const transfer = await scorerPermissionRepository.findOne({
            where: { id: transferId },
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer request not found');
        }
        if (transfer.userId !== rejectingUserId) {
            throw new common_1.BadRequestException('This transfer request is not for you');
        }
        if (transfer.transferStatus !== scorer_permission_entity_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException(`Transfer is ${transfer.transferStatus}, cannot reject`);
        }
        transfer.transferStatus = scorer_permission_entity_1.TransferStatus.REJECTED;
        transfer.updatedAt = new Date();
        if (dto.reason) {
            transfer.metadata = {
                ...transfer.metadata,
                rejectionReason: dto.reason,
            };
        }
        await scorerPermissionRepository.save(transfer);
        return {
            message: 'Scorer transfer rejected successfully',
        };
    }
    async revokeScorerAccess(matchId, fromUserId, dto) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        const mayScore = await this.canUserScore(matchId, fromUserId);
        if (!mayScore) {
            throw new common_1.BadRequestException('You do not have permission to revoke scorer access');
        }
        const permissionToRevoke = await scorerPermissionRepository.findOne({
            where: {
                matchId,
                userId: dto.userId,
                isActive: true,
            },
        });
        if (!permissionToRevoke) {
            throw new common_1.NotFoundException('User does not have active scoring permissions');
        }
        permissionToRevoke.isActive = false;
        permissionToRevoke.canScore = false;
        permissionToRevoke.transferStatus = scorer_permission_entity_1.TransferStatus.REVOKED;
        permissionToRevoke.revokedAt = new Date();
        permissionToRevoke.updatedAt = new Date();
        if (dto.reason) {
            permissionToRevoke.metadata = {
                ...permissionToRevoke.metadata,
                revocationReason: dto.reason,
                revokedBy: fromUserId,
            };
        }
        await scorerPermissionRepository.save(permissionToRevoke);
        return {
            message: 'Scoring access revoked successfully',
        };
    }
    async grantScorerAccess(matchId, fromUserId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const scorerPermissionRepository = queryRunner.manager.getRepository(scorer_permission_entity_1.ScorerPermission);
            const userRepository = queryRunner.manager.getRepository(user_entity_1.User);
            const mayScore = await this.canUserScore(matchId, fromUserId);
            if (!mayScore) {
                throw new common_1.BadRequestException('You do not have permission to grant scorer access');
            }
            const targetUser = await userRepository.findOne({
                where: { id: dto.userId },
            });
            if (!targetUser) {
                throw new common_1.NotFoundException('Target user not found');
            }
            const existingPermission = await scorerPermissionRepository.findOne({
                where: {
                    matchId,
                    userId: dto.userId,
                    isActive: true,
                },
            });
            if (existingPermission) {
                throw new common_1.ConflictException('User already has active scoring permissions');
            }
            const newPermission = scorerPermissionRepository.create({
                matchId,
                userId: dto.userId,
                role: dto.role,
                isActive: true,
                canScore: dto.role !== scorer_permission_entity_1.ScorerRole.VIEWER,
                transferredFrom: fromUserId,
                transferredTo: dto.userId,
                transferStatus: scorer_permission_entity_1.TransferStatus.ACCEPTED,
                transferredAt: new Date(),
                acceptedAt: new Date(),
                transferReason: dto.reason,
                metadata: {
                    grantedBy: fromUserId,
                },
            });
            const savedPermission = await scorerPermissionRepository.save(newPermission);
            await queryRunner.commitTransaction();
            return {
                permission: savedPermission,
                message: `Scoring access granted to ${targetUser.name}`,
            };
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateScorerRole(matchId, fromUserId, dto) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        const mayScore = await this.canUserScore(matchId, fromUserId);
        if (!mayScore) {
            throw new common_1.BadRequestException('You do not have permission to update scorer roles');
        }
        const permissionToUpdate = await scorerPermissionRepository.findOne({
            where: {
                matchId,
                userId: dto.userId,
                isActive: true,
            },
        });
        if (!permissionToUpdate) {
            throw new common_1.NotFoundException('User does not have active scoring permissions');
        }
        permissionToUpdate.role = dto.role;
        permissionToUpdate.canScore = dto.role !== scorer_permission_entity_1.ScorerRole.VIEWER;
        permissionToUpdate.updatedAt = new Date();
        if (dto.reason) {
            permissionToUpdate.metadata = {
                ...permissionToUpdate.metadata,
                roleUpdateReason: dto.reason,
                updatedBy: fromUserId,
            };
        }
        const savedPermission = await scorerPermissionRepository.save(permissionToUpdate);
        return {
            permission: savedPermission,
            message: 'Scorer role updated successfully',
        };
    }
    async getMatchScorers(matchId) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        return await scorerPermissionRepository.find({
            where: { matchId },
            relations: ['user', 'transferredFromUser', 'transferredToUser'],
            order: { createdAt: 'ASC' },
        });
    }
    async getActiveScorers(matchId) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        return await scorerPermissionRepository.find({
            where: { matchId, isActive: true },
            relations: ['user'],
        });
    }
    async getPendingTransfers(userId) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        return await scorerPermissionRepository.find({
            where: {
                userId,
                transferStatus: scorer_permission_entity_1.TransferStatus.PENDING,
            },
            relations: ['transferredFromUser', 'match'],
        });
    }
    async canUserScore(matchId, userId) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        const rows = await scorerPermissionRepository.find({ where: { matchId, userId } });
        if (rows.some(r => r.canScore && r.isActive))
            return true;
        if (rows.some(r => r.revokedAt))
            return false;
        if (rows.some(r => r.isActive && !r.canScore))
            return false;
        const activeScorer = await scorerPermissionRepository.findOne({
            where: { matchId, isActive: true, canScore: true },
        });
        if (activeScorer)
            return false;
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match)
            return false;
        const membership = await teamMemberRepository.findOne({
            where: [
                { userId, teamId: match.teamAId },
                { userId, teamId: match.teamBId },
            ],
        });
        if (!membership)
            return false;
        return (membership.role === team_roles_1.TeamRole.CAPTAIN || membership.role === team_roles_1.TeamRole.VICE_CAPTAIN);
    }
    async getTransferHistory(matchId) {
        const scorerPermissionRepository = this.dataSource.getRepository(scorer_permission_entity_1.ScorerPermission);
        const transfers = await scorerPermissionRepository.find({
            where: { matchId },
            relations: ['transferredFromUser', 'transferredToUser', 'user'],
            order: { transferredAt: 'DESC' },
        });
        const pendingTransfers = transfers.filter(t => t.transferStatus === scorer_permission_entity_1.TransferStatus.PENDING).length;
        const completedTransfers = transfers.filter(t => t.transferStatus === scorer_permission_entity_1.TransferStatus.ACCEPTED).length;
        const rejectedTransfers = transfers.filter(t => t.transferStatus === scorer_permission_entity_1.TransferStatus.REJECTED).length;
        const revokedTransfers = transfers.filter(t => t.transferStatus === scorer_permission_entity_1.TransferStatus.REVOKED).length;
        return {
            totalTransfers: transfers.length,
            pendingTransfers,
            completedTransfers,
            rejectedTransfers,
            revokedTransfers,
            transfers,
        };
    }
};
exports.ScorerTransferService = ScorerTransferService;
exports.ScorerTransferService = ScorerTransferService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], ScorerTransferService);
//# sourceMappingURL=scorer-transfer.service.js.map