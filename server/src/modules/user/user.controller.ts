import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('User Profile')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('profile')
  @ApiOperation({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiBody({ type: CreateProfileDto })
  async createProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    const profile = await this.userService.createProfile(req.user.userId, dto);
    return {
      data: profile,
      message: 'Profile created successfully',
    };
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: `
    Update the authenticated user's cricket profile.

    **Validation Rules:**
    - Batsman should not have bowling style
    - Bowler should not have batting style
    - All-rounder can have both
    - Experience must be 0-50 years
    `,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiBody({ type: CreateProfileDto })
  async updateProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    const profile = await this.userService.updateProfile(req.user.userId, dto);
    return {
      data: profile,
      message: 'Profile updated successfully',
    };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: `
    Get the authenticated user's cricket profile.

    **Returns:**
    - Complete profile information
    - Role and playing styles
    - Experience and bio
    - Creation timestamp
    `,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async getProfile(@Request() req: any) {
    const profile = await this.userService.getProfile(req.user.userId);
    return {
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }
}
