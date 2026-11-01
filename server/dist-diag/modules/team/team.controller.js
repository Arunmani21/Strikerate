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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const team_service_1 = require("./team.service");
const create_team_dto_1 = require("./dto/create-team.dto");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const team_permission_guard_1 = require("./team-permission.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const team_roles_1 = require("./team-roles");
let TeamController = class TeamController {
    constructor(teamService) {
        this.teamService = teamService;
    }
    async createTeam(req, dto) {
        const team = await this.teamService.createTeam(req.user.userId, dto);
        return {
            data: team,
            message: 'Team created successfully',
        };
    }
    async getMyTeams(req) {
        const teams = await this.teamService.getMyTeams(req.user.userId);
        return {
            data: teams,
            message: 'My teams retrieved successfully',
        };
    }
    async getTeam(id) {
        const team = await this.teamService.getTeam(id);
        return {
            data: team,
            message: 'Team retrieved successfully',
        };
    }
    async transferCaptaincy(id, req, dto) {
        const team = await this.teamService.transferCaptaincy(id, req.user.userId, dto);
        return {
            data: team,
            message: 'Captaincy transferred successfully',
        };
    }
    async assignViceCaptain(id, req, dto) {
        const teamMember = await this.teamService.assignViceCaptain(id, req.user.userId, dto);
        return {
            data: teamMember,
            message: 'Vice-captain assigned successfully',
        };
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new team',
        description: `
    Create a new cricket team. The creator automatically becomes the captain.

    **Team Structure:**
    - One captain (team creator)
    - One vice-captain (optional)
    - One manager (optional)
    - Multiple players

    **Captain Privileges:**
    - Add/remove players
    - Transfer captaincy
    - Assign vice-captain and manager
    - Select Playing 11
    - Score matches
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Team created successfully',
        schema: {
            example: {
                success: true,
                statusCode: 201,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Mumbai Indians',
                    captainId: '550e8400-e29b-41d4-a716-446655440000',
                    createdBy: '550e8400-e29b-41d4-a716-446655440000',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'Team created successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Team name already exists',
        schema: {
            example: {
                success: false,
                statusCode: 409,
                message: 'Team name already exists',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/team',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: create_team_dto_1.CreateTeamDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_team_dto_1.CreateTeamDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeam", null);
__decorate([
    (0, common_1.Get)('my-teams'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my teams',
        description: 'Get all teams the authenticated user is a member of',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User teams retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: [
                    {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        name: 'Mumbai Indians',
                        captainId: '550e8400-e29b-41d4-a716-446655440000',
                        createdAt: '2024-03-19T10:00:00.000Z',
                    },
                ],
                message: 'My teams retrieved successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeams", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get team details',
        description: 'Get detailed information about a specific team',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Team details retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Mumbai Indians',
                    captainId: '550e8400-e29b-41d4-a716-446655440000',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'Team retrieved successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Patch)(':id/transfer-captaincy'),
    (0, common_1.UseGuards)(team_permission_guard_1.TeamPermissionGuard),
    (0, roles_decorator_1.Roles)(team_roles_1.TeamRole.CAPTAIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer captaincy',
        description: `
    Transfer team captaincy to another team member.

    **Requirements:**
    - Must be current captain
    - New captain must be a team member

    **Effects:**
    - Old captain becomes regular player
    - New captain gets full captain privileges
    - Team captain_id is updated
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Captaincy transferred successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Mumbai Indians',
                    captainId: '550e8400-e29b-41d4-a716-446655440001',
                },
                message: 'Captaincy transferred successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Not the captain',
        schema: {
            example: {
                success: false,
                statusCode: 403,
                message: 'Only current captain can transfer captaincy',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/team/123/transfer-captaincy',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: assign_role_dto_1.AssignRoleDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "transferCaptaincy", null);
__decorate([
    (0, common_1.Patch)(':id/assign-vice-captain'),
    (0, common_1.UseGuards)(team_permission_guard_1.TeamPermissionGuard),
    (0, roles_decorator_1.Roles)(team_roles_1.TeamRole.CAPTAIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Assign vice-captain',
        description: `
    Assign or reassign the vice-captain role.

    **Requirements:**
    - Must be captain
    - Target must be a team member

    **Note:** Only one vice-captain per team. Previous vice-captain becomes regular player.
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Team ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vice-captain assigned successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Not the captain',
    }),
    (0, swagger_1.ApiBody)({ type: assign_role_dto_1.AssignRoleDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "assignViceCaptain", null);
exports.TeamController = TeamController = __decorate([
    (0, swagger_1.ApiTags)('Teams'),
    (0, common_1.Controller)('team'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map