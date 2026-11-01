import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security headers. CSP stays off: this is a JSON API, and Swagger UI needs inline scripts.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Parses the OAuth state cookie for the Google sign-in callback
  app.use(cookieParser());

  // Behind a reverse proxy (nginx/ALB) this makes req.ip the real client IP for rate limiting
  if (process.env.TRUST_PROXY === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

  // Setup Swagger documentation
  setupSwagger(app);

  // Get port from config
  const port = configService.get('app.port');

  await app.listen(port);
  console.log(`
🏏 Strikerate API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 API:        http://localhost:${port}
📚 Docs:       http://localhost:${port}/api-docs
🏟️  Health:    http://localhost:${port}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
