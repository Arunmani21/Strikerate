import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the API server is running and healthy',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-03-19T10:00:00.000Z',
        uptime: 3600,
        environment: 'development',
        version: '1.0.0',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
