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
exports.TeamManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("./team.entity");
const team_member_entity_1 = require("./team-member.entity");
const team_roles_1 = require("./team-roles");
let TeamManagementService = class TeamManagementService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getUserRole(teamId, userId) {
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        const teamMember = await teamMemberRepository.findOne({
            where: { teamId, userId, isActive: true },
        });
        return teamMember;
    }
    async checkPermission(teamId, userId, requiredPermission) {
        const teamMember = await this.getUserRole(teamId, userId);
        if (!teamMember) {
            return false;
        }
        return (0, team_roles_1.hasPermission)(teamMember.role, requiredPermission);
    }
    async updateTeamDetails(teamId, dto, userId) {
        const hasUpdatePermission = await this.checkPermission(teamId, userId, team_roles_1.TeamPermission.UPDATE_TEAM_DETAILS);
        if (!hasUpdatePermission) {
            throw new common_1.ForbiddenException('You do not have permission to update team details. Only CAPTAIN can update team details.');
        }
        const teamRepository = this.dataSource.getRepository(team_entity_1.Team);
        const team = await teamRepository.findOne({ where: { id: teamId } });
        if (!team) {
            throw new common_1.NotFoundException('Team not found');
        }
        if (dto.name)
            team.name = dto.name;
        if (dto.homeGround)
            team.homeGround = dto.homeGround;
        if (dto.description)
            team.description = dto.description;
        if (dto.logoUrl)
            team.logoUrl = dto.logoUrl;
        const updatedTeam = await teamRepository.save(team);
        return {
            team: updatedTeam,
            message: 'Team details updated successfully',
        };
    }
    async updateMemberRole(teamId, targetUserId, dto, userId) {
        const currentMember = await this.getUserRole(teamId, userId);
        if (!currentMember) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        if (!(0, team_roles_1.hasPermission)(currentMember.role, team_roles_1.TeamPermission.UPDATE_MEMBER_ROLES)) {
            throw new common_1.ForbiddenException('You do not have permission to update member roles. Only CAPTAIN can update member roles.');
        }
        if (!(0, team_roles_1.canManageRole)(currentMember.role, dto.role)) {
            throw new common_1.ForbiddenException(`You cannot assign ${dto.role.toUpperCase()} role. You can only assign roles with lower or equal hierarchy level.`);
        }
        const targetMember = await this.getUserRole(teamId, targetUserId);
        if (!targetMember) {
            throw new common_1.NotFoundException('Target user is not a member of this team');
        }
        if (!(0, team_roles_1.canManageRole)(currentMember.role, targetMember.role)) {
            throw new common_1.ForbiddenException('You cannot modify the role of someone with higher or equal hierarchy level');
        }
        if (targetUserId === userId && currentMember.role === team_roles_1.TeamRole.CAPTAIN) {
            const captainCount = await this.dataSource.getRepository(team_member_entity_1.TeamMember).count({
                where: { teamId, role: team_roles_1.TeamRole.CAPTAIN, isActive: true },
            });
            if (captainCount <= 1) {
                throw new common_1.BadRequestException('Cannot demote yourself as you are the only captain. Assign another captain first.');
            }
        }
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        targetMember.role = dto.role;
        targetMember.roleUpdatedAt = new Date();
        targetMember.roleUpdatedBy = userId;
        const updatedMember = await teamMemberRepository.save(targetMember);
        return {
            teamMember: updatedMember,
            message: `Member role updated to ${dto.role.toUpperCase()}`,
        };
    }
    async addTeamMember(teamId, dto, userId) {
        const hasAddPermission = await this.checkPermission(teamId, userId, team_roles_1.TeamPermission.ADD_MEMBERS);
        if (!hasAddPermission) {
            throw new common_1.ForbiddenException('You do not have permission to add members. Only CAPTAIN and VICE_CAPTAIN can add members.');
        }
        const userRepository = this.dataSource.getRepository('User');
        const user = await userRepository.findOne({ where: { id: dto.userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        const existingMember = await teamMemberRepository.findOne({
            where: { teamId, userId: dto.userId },
        });
        if (existingMember) {
            if (existingMember.isActive) {
                throw new common_1.BadRequestException('User is already a member of this team');
            }
            else {
                existingMember.isActive = true;
                existingMember.role = dto.role;
                existingMember.joinedAt = new Date();
                existingMember.jerseyNumber = dto.jerseyNumber;
                existingMember.battingStyle = dto.battingStyle;
                existingMember.bowlingStyle = dto.bowlingStyle;
                existingMember.playerType = dto.playerType;
                const reactivatedMember = await teamMemberRepository.save(existingMember);
                return {
                    teamMember: reactivatedMember,
                    message: 'Member reactivated successfully',
                };
            }
        }
        const currentMember = await this.getUserRole(teamId, userId);
        if (currentMember && !(0, team_roles_1.canManageRole)(currentMember.role, dto.role)) {
            throw new common_1.ForbiddenException(`You cannot add members with ${dto.role.toUpperCase()} role. You can only assign roles with lower or equal hierarchy level.`);
        }
        const teamMember = teamMemberRepository.create({
            teamId,
            userId: dto.userId,
            role: dto.role,
            jerseyNumber: dto.jerseyNumber,
            battingStyle: dto.battingStyle,
            bowlingStyle: dto.bowlingStyle,
            playerType: dto.playerType,
            isActive: true,
        });
        const savedMember = await teamMemberRepository.save(teamMember);
        return {
            teamMember: savedMember,
            message: `Member added to team as ${dto.role.toUpperCase()}`,
        };
    }
    async removeTeamMember(teamId, dto, userId) {
        const hasRemovePermission = await this.checkPermission(teamId, userId, team_roles_1.TeamPermission.REMOVE_MEMBERS);
        if (!hasRemovePermission) {
            throw new common_1.ForbiddenException('You do not have permission to remove members. Only CAPTAIN and VICE_CAPTAIN can remove members.');
        }
        const targetMember = await this.getUserRole(teamId, dto.userId);
        if (!targetMember) {
            throw new common_1.NotFoundException('User is not a member of this team');
        }
        const currentMember = await this.getUserRole(teamId, userId);
        if (!currentMember) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        if (!(0, team_roles_1.canManageRole)(currentMember.role, targetMember.role)) {
            throw new common_1.ForbiddenException('You cannot remove members with higher or equal hierarchy level');
        }
        if (dto.userId === userId && currentMember.role === team_roles_1.TeamRole.CAPTAIN) {
            const captainCount = await this.dataSource.getRepository(team_member_entity_1.TeamMember).count({
                where: { teamId, role: team_roles_1.TeamRole.CAPTAIN, isActive: true },
            });
            if (captainCount <= 1) {
                throw new common_1.BadRequestException('Cannot remove yourself as you are the only captain. Assign another captain first.');
            }
        }
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        targetMember.isActive = false;
        await teamMemberRepository.save(targetMember);
        if (targetMember.role === team_roles_1.TeamRole.CAPTAIN) {
            const viceCaptain = await teamMemberRepository.findOne({
                where: { teamId, role: team_roles_1.TeamRole.VICE_CAPTAIN, isActive: true },
            });
            if (viceCaptain) {
                viceCaptain.role = team_roles_1.TeamRole.CAPTAIN;
                await teamMemberRepository.save(viceCaptain);
                return {
                    message: 'Member removed from team successfully. Vice-captain has been promoted to captain.',
                };
            }
        }
        return {
            message: 'Member removed from team successfully',
        };
    }
    async setCaptain(teamId, dto, userId) {
        const hasPermission = await this.checkPermission(teamId, userId, team_roles_1.TeamPermission.UPDATE_MEMBER_ROLES);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('You do not have permission to set captain. Only CAPTAIN can set captain.');
        }
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        await teamMemberRepository.update({ teamId, role: team_roles_1.TeamRole.CAPTAIN }, { role: team_roles_1.TeamRole.PLAYER });
        await teamMemberRepository.update({ teamId, role: team_roles_1.TeamRole.VICE_CAPTAIN }, { role: team_roles_1.TeamRole.PLAYER });
        const captain = await teamMemberRepository.findOne({
            where: { teamId, userId: dto.captainId, isActive: true },
        });
        if (!captain) {
            throw new common_1.NotFoundException('Captain user is not a member of this team');
        }
        captain.role = team_roles_1.TeamRole.CAPTAIN;
        await teamMemberRepository.save(captain);
        if (dto.viceCaptainId) {
            const viceCaptain = await teamMemberRepository.findOne({
                where: { teamId, userId: dto.viceCaptainId, isActive: true },
            });
            if (!viceCaptain) {
                throw new common_1.NotFoundException('Vice-captain user is not a member of this team');
            }
            viceCaptain.role = team_roles_1.TeamRole.VICE_CAPTAIN;
            await teamMemberRepository.save(viceCaptain);
        }
        return {
            message: 'Captain and vice-captain set successfully',
        };
    }
    async updateTeamAvailability(teamId, dto, userId) {
        const hasPermission = await this.checkPermission(teamId, userId, team_roles_1.TeamPermission.SET_TEAM_AVAILABILITY);
        if (!hasPermission) {
            throw new common_1.ForbiddenException('You do not have permission to set team availability. Only CAPTAIN and VICE_CAPTAIN can set team availability.');
        }
        const matchRepository = this.dataSource.getRepository('Match');
        const match = await matchRepository.findOne({ where: { id: dto.matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        if (match.teamAId !== teamId && match.teamBId !== teamId) {
            throw new common_1.BadRequestException('Your team is not playing in this match');
        }
        const availabilityRepository = this.dataSource.getRepository('TeamAvailability');
        const existingAvailability = await availabilityRepository.findOne({
            where: { matchId: dto.matchId, teamId },
        });
        if (existingAvailability) {
            existingAvailability.isAvailable = dto.isAvailable;
            existingAvailability.notes = dto.notes;
            await availabilityRepository.save(existingAvailability);
        }
        else {
            const availability = availabilityRepository.create({
                matchId: dto.matchId,
                teamId,
                isAvailable: dto.isAvailable,
                notes: dto.notes,
                metadata: dto.details,
            });
            await availabilityRepository.save(availability);
        }
        return {
            message: `Team availability updated to ${dto.isAvailable ? 'available' : 'unavailable'}`,
        };
    }
    async updatePersonalAvailability(teamId, dto, userId) {
        const teamMember = await this.getUserRole(teamId, userId);
        if (!teamMember) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        const matchRepository = this.dataSource.getRepository('Match');
        const match = await matchRepository.findOne({ where: { id: dto.matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        if (match.teamAId !== teamId && match.teamBId !== teamId) {
            throw new common_1.BadRequestException('Your team is not playing in this match');
        }
        if (dto.isAvailable) {
            const otherTeamId = match.teamAId === teamId ? match.teamBId : match.teamAId;
            const otherTeamMembership = await this.getUserRole(otherTeamId, userId);
            if (otherTeamMembership) {
                const availabilityRepository = this.dataSource.getRepository('TeamAvailability');
                const otherTeamAvailability = await availabilityRepository.findOne({
                    where: {
                        matchId: dto.matchId,
                        teamId: otherTeamId,
                        userId,
                        isAvailable: true,
                    },
                });
                if (otherTeamAvailability) {
                    throw new common_1.BadRequestException(`You are already available for the other team in this match. A player cannot be available for both teams in the same match.`);
                }
            }
        }
        const availabilityRepository = this.dataSource.getRepository('TeamAvailability');
        const existingAvailability = await availabilityRepository.findOne({
            where: { matchId: dto.matchId, teamId, userId },
        });
        if (existingAvailability) {
            existingAvailability.isAvailable = dto.isAvailable;
            existingAvailability.notes = dto.reason;
            await availabilityRepository.save(existingAvailability);
        }
        else {
            const availability = availabilityRepository.create({
                matchId: dto.matchId,
                teamId,
                userId,
                isAvailable: dto.isAvailable,
                notes: dto.reason,
                metadata: dto.details,
            });
            await availabilityRepository.save(availability);
        }
        return {
            message: `Your availability updated to ${dto.isAvailable ? 'available' : 'unavailable'}`,
        };
    }
    async getTeamMembers(teamId) {
        const teamMemberRepository = this.dataSource.getRepository(team_member_entity_1.TeamMember);
        return await teamMemberRepository.find({
            where: { teamId, isActive: true },
            relations: ['user'],
            order: { role: 'ASC', joinedAt: 'ASC' },
        });
    }
    async getTeamStats(teamId) {
        const matchRepository = this.dataSource.getRepository('Match');
        const totalMatches = await matchRepository.count({
            where: [{ teamAId: teamId }, { teamBId: teamId }],
        });
        const wonMatches = await matchRepository.count({
            where: [
                { teamAId: teamId, winningTeamId: teamId },
                { teamBId: teamId, winningTeamId: teamId },
            ],
        });
        return {
            totalMatches,
            wonMatches,
            lostMatches: totalMatches - wonMatches,
            winPercentage: totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0,
        };
    }
};
exports.TeamManagementService = TeamManagementService;
exports.TeamManagementService = TeamManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TeamManagementService);
//# sourceMappingURL=team-management.service.js.map