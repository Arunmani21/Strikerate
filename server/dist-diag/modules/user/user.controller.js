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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const create_profile_dto_1 = require("./dto/create-profile.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async createProfile(req, dto) {
        const profile = await this.userService.createProfile(req.user.userId, dto);
        return {
            data: profile,
            message: 'Profile created successfully',
        };
    }
    async updateProfile(req, dto) {
        const profile = await this.userService.updateProfile(req.user.userId, dto);
        return {
            data: profile,
            message: 'Profile updated successfully',
        };
    }
    async getProfile(req) {
        const profile = await this.userService.getProfile(req.user.userId);
        return {
            data: profile,
            message: 'Profile retrieved successfully',
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create user profile',
        description: `
    Create a cricket profile for the authenticated user.

    **Profile Information:**
    - Role: batsman, bowler, allrounder, or keeper
    - Batting style: right_hand or left_hand
    - Bowling style: various options (optional for batsmen)
    - Experience: years of playing cricket
    - Bio: short description

    **Note:** Profile can only be created once. Use PATCH to update.
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Profile created successfully',
        schema: {
            example: {
                success: true,
                statusCode: 201,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    role: 'allrounder',
                    battingStyle: 'right_hand',
                    bowlingStyle: 'right_arm_fast',
                    experienceYears: 5,
                    bio: 'Experienced all-rounder player',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'Profile created successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Profile already exists',
        schema: {
            example: {
                success: false,
                statusCode: 400,
                message: 'Profile already exists. Use PATCH to update.',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/user/profile',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: create_profile_dto_1.CreateProfileDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_profile_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user profile',
        description: `
    Update the authenticated user's cricket profile.

    **Validation Rules:**
    - Batsman should not have bowling style
    - Bowler should not have batting style
    - All-rounder can have both
    - Experience must be 0-50 years
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile updated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    role: 'allrounder',
                    battingStyle: 'left_hand',
                    experienceYears: 6,
                    bio: 'Experienced all-rounder player',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'Profile updated successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Profile not found',
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Profile not found',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/user/profile',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: create_profile_dto_1.CreateProfileDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_profile_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user profile',
        description: `
    Get the authenticated user's cricket profile.

    **Returns:**
    - Complete profile information
    - Role and playing styles
    - Experience and bio
    - Creation timestamp
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    userId: '550e8400-e29b-41d4-a716-446655440000',
                    role: 'allrounder',
                    battingStyle: 'right_hand',
                    bowlingStyle: 'right_arm_fast',
                    experienceYears: 5,
                    bio: 'Experienced all-rounder player',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'Profile retrieved successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Profile not found',
        schema: {
            example: {
                success: false,
                statusCode: 404,
                message: 'Profile not found',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/user/profile',
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('User Profile'),
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map