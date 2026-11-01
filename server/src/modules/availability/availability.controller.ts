import {
  Controller,
  Patch,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PlayerService } from '../player/player.service';
import { UpdatePlayerAvailabilityDto } from '../player/dto/player-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Player Availability')
@Controller('player')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AvailabilityController {
  constructor(private playerService: PlayerService) {}

  @Patch('availability')
  @ApiOperation({
    summary: 'Set player availability',
    description: `
    Set or update player availability for a specific date.

    **Requirements:**
    - Can set own availability
    - Captain/manager can set team player availability

    **Parameters:**
    - playerId: Player to update
    - availableDate: Date (YYYY-MM-DD format)
    - isAvailable: Available status (true/false)
    - reason: Optional reason for unavailability
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          message: 'Player availability updated successfully',
        },
        message: 'Player availability updated successfully',
        timestamp: '2024-03-19T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid permission or data',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
  })
  @ApiBody({ type: UpdatePlayerAvailabilityDto })
  async setPlayerAvailability(
    @Request() req: any,
    @Body() dto: UpdatePlayerAvailabilityDto,
  ) {
    const result = await this.playerService.setPlayerAvailability(
      req.user.userId,
      dto,
    );
    return {
      data: result,
      message: 'Player availability updated successfully',
    };
  }
}
