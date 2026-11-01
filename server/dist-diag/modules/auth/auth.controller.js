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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        const user = await this.authService.register(registerDto);
        return {
            data: user,
            message: 'User registered successfully',
        };
    }
    async login(loginDto) {
        const result = await this.authService.login(loginDto);
        return {
            data: result,
            message: 'Login successful',
        };
    }
    async getMe(req) {
        const user = await this.authService.getMe(req.user.userId);
        return {
            data: user,
            message: 'User profile retrieved successfully',
        };
    }
    async verifyEmail(body) {
        const result = await this.authService.verifyEmailOTP(body.email, body.otp);
        return {
            data: result,
            message: 'Email verification completed',
        };
    }
    async resendOTP(body) {
        const result = await this.authService.resendOTP(body.email);
        return {
            data: result,
            message: 'OTP resent successfully',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register new user',
        description: `
    Create a new user account with email and password.

    **Password Requirements:**
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - No common passwords
    - No sequential characters

    **Name Requirements:**
    - 2-50 characters
    - Letters and spaces only

    **Note:** The user will automatically become the captain of any teams they create.
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User successfully registered',
        schema: {
            example: {
                success: true,
                statusCode: 201,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    createdAt: '2024-03-19T10:00:00.000Z',
                },
                message: 'User registered successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Email already exists',
        schema: {
            example: {
                success: false,
                statusCode: 409,
                message: 'An account with this email already exists',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/auth/register',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error (weak password, invalid email, etc.)',
        schema: {
            example: {
                success: false,
                statusCode: 400,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/auth/register',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: `
    Authenticate user with email and password.

    **Returns:**
    - JWT access token (valid for 24 hours)
    - User information (without password)

    **Security Note:**
    - Generic error message prevents user enumeration
    - Password is never included in response
    - Token must be included in Authorization header for protected routes
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Login successful',
        schema: {
            example: {
                success: true,
                statusCode: 201,
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                    },
                },
                message: 'Login successful',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid credentials',
        schema: {
            example: {
                success: false,
                statusCode: 401,
                message: 'Invalid email or password',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/auth/login',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                statusCode: 400,
                message: 'Please provide a valid email address',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/auth/login',
            },
        },
    }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user',
        description: `
    Get the authenticated user's profile information.

    **Requirements:**
    - Valid JWT token in Authorization header
    - Token must not be expired

    **Returns:**
    - Complete user profile including statistics
    - User's teams and roles
    - Password is never included
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    createdAt: '2024-03-19T10:00:00.000Z',
                    profile: {
                        id: '550e8400-e29b-41d4-a716-446655440001',
                        role: 'allrounder',
                        battingStyle: 'right_hand',
                        bowlingStyle: 'right_arm_fast',
                        experienceYears: 5,
                        bio: 'Experienced all-rounder player',
                    },
                },
                message: 'User profile retrieved successfully',
                timestamp: '2024-03-19T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing token',
        schema: {
            example: {
                success: false,
                statusCode: 401,
                message: 'Unauthorized',
                timestamp: '2024-03-19T10:00:00.000Z',
                path: '/auth/me',
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-email'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify email with OTP',
        description: `
    Verify email address using the OTP sent during registration.

    **Process:**
    - User provides email and 6-digit OTP
    - System validates OTP and expiry
    - Marks user email as verified
    - Sends welcome email upon successful verification

    **OTP Details:**
    - Valid for 10 minutes
    - Maximum 3 attempts
    - Case-insensitive
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Email verified successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                data: {
                    message: 'Email verified successfully',
                    user: {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        emailVerified: true,
                    },
                },
                timestamp: '2026-04-07T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired OTP',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Maximum attempts exceeded',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                otp: { type: 'string', example: '123456' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('resend-otp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Resend OTP',
        description: `
    Resend OTP code to email if previous one expired or not received.

    **Note:** This invalidates the previous OTP and generates a new one.
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'New OTP sent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Email already verified',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOTP", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map