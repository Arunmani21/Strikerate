import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InningsService } from './innings.service';
import { StartInningsDto } from './dto/start-innings.dto';
import { SetBatsmenDto } from './dto/set-batsmen.dto';
import { SetBowlerDto } from './dto/set-bowler.dto';

@ApiTags('innings')
@Controller('innings')
export class InningsController {
  constructor(private readonly inningsService: InningsService) {}

  @Post('match/:matchId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start an innings for a match' })
  @ApiResponse({ status: 201, description: 'Innings started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async startInnings(
    @Param('matchId') matchId: string,
    @Req() req: any,
    @Body() dto: StartInningsDto,
  ) {
    const innings = await this.inningsService.startInnings(
      matchId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: innings,
      message: 'Innings started successfully',
    };
  }

  @Patch(':id/set-batsmen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set striker and non-striker batsmen' })
  @ApiResponse({ status: 200, description: 'Batsmen set successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Innings not found' })
  async setBatsmen(
    @Param('id') inningsId: string,
    @Req() req: any,
    @Body() dto: SetBatsmenDto,
  ) {
    const innings = await this.inningsService.setBatsmen(
      inningsId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: innings,
      message: 'Batsmen set successfully',
    };
  }

  @Patch(':id/set-bowler')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set current bowler' })
  @ApiResponse({ status: 200, description: 'Bowler set successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Innings not found' })
  async setBowler(
    @Param('id') inningsId: string,
    @Req() req: any,
    @Body() dto: SetBowlerDto,
  ) {
    const innings = await this.inningsService.setBowler(
      inningsId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: innings,
      message: 'Bowler set successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get innings by ID' })
  @ApiResponse({ status: 200, description: 'Innings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Innings not found' })
  @HttpCode(HttpStatus.OK)
  async getInnings(@Param('id') inningsId: string) {
    const innings = await this.inningsService.getInnings(inningsId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: innings,
      message: 'Innings retrieved successfully',
    };
  }

  @Get('match/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all innings for a match' })
  @ApiResponse({ status: 200, description: 'Innings retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getMatchInnings(@Param('matchId') matchId: string) {
    const innings = await this.inningsService.getMatchInnings(matchId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: innings,
      message: 'Innings retrieved successfully',
    };
  }
}
