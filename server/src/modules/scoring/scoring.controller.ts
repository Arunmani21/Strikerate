import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScoringService } from './scoring.service';
import { BallInputDto } from './dto/ball-input.dto';

@ApiTags('scoring')
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('ball')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a ball delivery' })
  @ApiResponse({ status: 201, description: 'Ball recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Innings, match, or player not found' })
  async deliverBall(
    @Req() req: any,
    @Body() dto: BallInputDto,
  ) {
    const result = await this.scoringService.deliverBall(req.user.userId, dto);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'Ball recorded successfully',
    };
  }

  @Get('scorecard/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed scorecard for a match' })
  @ApiResponse({ status: 200, description: 'Scorecard retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @HttpCode(HttpStatus.OK)
  async getScorecard(@Param('matchId') matchId: string) {
    const scorecard = await this.scoringService.getScorecard(matchId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: scorecard,
      message: 'Scorecard retrieved successfully',
    };
  }

  @Get('over-summary/:inningsId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get over-by-over summary for an innings' })
  @ApiResponse({ status: 200, description: 'Over summary retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getOverSummary(@Param('inningsId') inningsId: string) {
    const summary = await this.scoringService.getOverSummary(inningsId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: summary,
      message: 'Over summary retrieved successfully',
    };
  }
}
