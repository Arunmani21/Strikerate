import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperOverService } from './super-over.service';
import {
  StartSuperOverDto,
  SuperOverBallDto,
  CompleteSuperOverDto,
  AbandonSuperOverDto,
  SuperOverStatusDto,
} from './dto/super-over.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Super Over')
@Controller('matches/:matchId/super-overs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuperOverController {
  constructor(private readonly superOverService: SuperOverService) {}

  /**
   * Start a super over for a tied match
   */
  @Post()
  @ApiOperation({ summary: 'Start a super over for a tied match' })
  @ApiResponse({ status: 201, description: 'Super over started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request - match must be tied' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async startSuperOver(
    @Param('matchId') matchId: string,
    @Body() startSuperOverDto: StartSuperOverDto,
    @Request() req,
  ) {
    return await this.superOverService.startSuperOver(
      matchId,
      startSuperOverDto,
      req.user.userId,
    );
  }

  /**
   * Begin super over innings (sets batting order based on toss)
   */
  @Post(':superOverId/begin')
  @ApiOperation({ summary: 'Begin super over innings after toss' })
  @ApiResponse({ status: 200, description: 'Super over innings started' })
  @ApiResponse({ status: 400, description: 'Super over not in scheduled state' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async beginSuperOverInnings(
    @Param('superOverId') superOverId: string,
    @Request() req,
  ) {
    return await this.superOverService.beginSuperOverInnings(
      superOverId,
      req.user.userId,
    );
  }

  /**
   * Record a ball in super over
   * CRITICAL: If batting team loses 2 wickets, innings ends immediately
   */
  @Post(':superOverId/ball')
  @ApiOperation({
    summary: 'Record a ball in super over',
    description: 'Records ball-by-ball action. If batting team loses 2 wickets, innings ends immediately. If 6 balls completed, innings ends.',
  })
  @ApiResponse({ status: 200, description: 'Ball recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async deliverSuperOverBall(
    @Param('superOverId') superOverId: string,
    @Body() superOverBallDto: SuperOverBallDto,
    @Request() req,
  ) {
    return await this.superOverService.deliverSuperOverBall(
      superOverId,
      superOverBallDto,
      req.user.userId,
    );
  }

  /**
   * Complete super over manually
   */
  @Post(':superOverId/complete')
  @ApiOperation({ summary: 'Complete super over manually' })
  @ApiResponse({ status: 200, description: 'Super over completed successfully' })
  @ApiResponse({ status: 400, description: 'Super over not in progress' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async completeSuperOver(
    @Param('superOverId') superOverId: string,
    @Body() completeSuperOverDto: CompleteSuperOverDto,
    @Request() req,
  ) {
    return await this.superOverService.completeSuperOver(
      superOverId,
      completeSuperOverDto,
      req.user.userId,
    );
  }

  /**
   * Abandon super over (weather, etc.)
   */
  @Post(':superOverId/abandon')
  @ApiOperation({ summary: 'Abandon super over due to weather or other reasons' })
  @ApiResponse({ status: 200, description: 'Super over abandoned' })
  @ApiResponse({ status: 400, description: 'Super over not in valid state for abandonment' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async abandonSuperOver(
    @Param('superOverId') superOverId: string,
    @Body() abandonSuperOverDto: AbandonSuperOverDto,
    @Request() req,
  ) {
    return await this.superOverService.abandonSuperOver(
      superOverId,
      abandonSuperOverDto,
      req.user.userId,
    );
  }

  /**
   * Update super over status
   */
  @Put(':superOverId/status')
  @ApiOperation({ summary: 'Update super over status' })
  @ApiResponse({ status: 200, description: 'Super over status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async updateSuperOverStatus(
    @Param('superOverId') superOverId: string,
    @Body() superOverStatusDto: SuperOverStatusDto,
    @Request() req,
  ) {
    return await this.superOverService.updateSuperOverStatus(
      superOverId,
      superOverStatusDto,
      req.user.userId,
    );
  }

  /**
   * Get super over by ID
   */
  @Get(':superOverId')
  @ApiOperation({ summary: 'Get super over details' })
  @ApiResponse({ status: 200, description: 'Super over details retrieved' })
  @ApiResponse({ status: 404, description: 'Super over not found' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'superOverId', description: 'Super Over ID' })
  async getSuperOver(@Param('superOverId') superOverId: string) {
    return await this.superOverService.getSuperOver(superOverId);
  }

  /**
   * Get all super overs for a match
   */
  @Get()
  @ApiOperation({ summary: 'Get all super overs for a match' })
  @ApiResponse({ status: 200, description: 'Super overs retrieved' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async getMatchSuperOvers(@Param('matchId') matchId: string) {
    return await this.superOverService.getMatchSuperOvers(matchId);
  }
}
