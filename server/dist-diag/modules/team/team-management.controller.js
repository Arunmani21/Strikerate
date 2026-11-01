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
exports.TeamManagementController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const team_management_service_1 = require("./team-management.service");
const team_management_dto_1 = require("./dto/team-management.dto");
const swagger_1 = require("@nestjs/swagger");
let TeamManagementController = class TeamManagementController {
    constructor(teamManagementService) {
        this.teamManagementService = teamManagementService;
    }
    async updateTeamDetails(teamId, updateTeamDetailsDto, req) {
        return await this.teamManagementService.updateTeamDetails(teamId, updateTeamDetailsDto, req.user.userId);
    }
    async updateMemberRole(teamId, userId, updateMemberRoleDto, req) {
        return await this.teamManagementService.updateMemberRole(teamId, userId, updateMemberRoleDto, req.user.userId);
    }
    async addTeamMember(teamId, addTeamMemberDto, req) {
        return await this.teamManagementService.addTeamMember(teamId, addTeamMemberDto, req.user.userId);
    }
    async removeTeamMember(teamId, removeTeamMemberDto, req) {
        return await this.teamManagementService.removeTeamMember(teamId, removeTeamMemberDto, req.user.userId);
    }
    async setCaptain(teamId, setCaptainDto, req) {
        return await this.teamManagementService.setCaptain(teamId, setCaptainDto, req.user.userId);
    }
    async updateTeamAvailability(teamId, updateTeamAvailabilityDto, req) {
        return await this.teamManagementService.updateTeamAvailability(teamId, updateTeamAvailabilityDto, req.user.userId);
    }
    async updatePersonalAvailability(teamId, updatePersonalAvailabilityDto, req) {
        return await this.teamManagementService.updatePersonalAvailability(teamId, updatePersonalAvailabilityDto, req.user.userId);
    }
    async getTeamMembers(teamId) {
        return await this.teamManagementService.getTeamMembers(teamId);
    }
    async getTeamStats(teamId) {
        return await this.teamManagementService.getTeamStats(teamId);
    }
    async getMyRole(teamId, req) {
        const teamMember = await this.teamManagementService.getUserRole(teamId, req.user.userId);
        if (!teamMember) {
            return {
                role: null,
                isMember: false,
                message: 'You are not a member of this team',
            };
        }
        return {
            role: teamMember.role,
            isMember: true,
            joinedAt: teamMember.joinedAt,
            permissions: this.getPermissionsForRole(teamMember.role),
        };
    }
    getPermissionsForRole(role) {
        const { ROLE_PERMISSIONS } = require('./team-roles');
        return ROLE_PERMISSIONS[role] || [];
    }
};
exports.TeamManagementController = TeamManagementController;
__decorate([
    (0, common_1.Put)(':teamId/details'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update team details',
        description: 'Only OWNER and ADMIN can update team details. Includes name, logo, venue, contact info.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team details updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.UpdateTeamDetailsDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "updateTeamDetails", null);
__decorate([
    (0, common_1.Put)(':teamId/members/:userId/role'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update team member role',
        description: 'Only CAPTAIN can update member roles. Can only assign VICE_CAPTAIN role.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Member role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or member not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, team_management_dto_1.UpdateMemberRoleDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Post)(':teamId/members'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add member to team',
        description: 'Only CAPTAIN and VICE_CAPTAIN can add members. User will be added with specified role.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Member added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or user not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User already a member' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.AddTeamMemberDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "addTeamMember", null);
__decorate([
    (0, common_1.Delete)(':teamId/members'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove member from team',
        description: 'Only CAPTAIN and VICE_CAPTAIN can remove members. Cannot remove CAPTAIN if they are the only captain.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Member removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or member not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.RemoveTeamMemberDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "removeTeamMember", null);
__decorate([
    (0, common_1.Post)(':teamId/captain'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set captain and vice-captain',
        description: 'Only CAPTAIN can set captain and vice-captain. Previous captain/vice-captain will be demoted to PLAYER.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Captain set successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or user not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.SetCaptainDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "setCaptain", null);
__decorate([
    (0, common_1.Put)(':teamId/availability'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update team availability for a match',
        description: 'CAPTAIN and VICE_CAPTAIN can set team availability for upcoming matches.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team availability updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or match not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.UpdateTeamAvailabilityDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "updateTeamAvailability", null);
__decorate([
    (0, common_1.Put)(':teamId/personal-availability'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update personal availability for a match',
        description: 'All members can update their own availability for upcoming matches.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Personal availability updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - not a team member' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team or match not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_management_dto_1.UpdatePersonalAvailabilityDto, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "updatePersonalAvailability", null);
__decorate([
    (0, common_1.Get)(':teamId/members'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get team members with their roles',
        description: 'Returns all active team members with their roles and details.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team members retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.Get)(':teamId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get team statistics',
        description: 'Returns team statistics including total matches, wins, losses, and win percentage.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "getTeamStats", null);
__decorate([
    (0, common_1.Get)(':teamId/my-role'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user\'s role in a team',
        description: 'Returns the current user\'s role and permissions in the specified team.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found or user not a member' }),
    (0, swagger_1.ApiParam)({ name: 'teamId', description: 'Team ID' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamManagementController.prototype, "getMyRole", null);
exports.TeamManagementController = TeamManagementController = __decorate([
    (0, swagger_1.ApiTags)('Team Management'),
    (0, common_1.Controller)('teams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [team_management_service_1.TeamManagementService])
], TeamManagementController);
//# sourceMappingURL=team-management.controller.js.map