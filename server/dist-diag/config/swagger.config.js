"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('🏏 Strikerate API')
        .setDescription(`
      # Cricket Scoring & Performance Analysis API

      ## Overview
      Strikerate is a production-grade cricket scoring and performance analysis backend built with NestJS, TypeORM, PostgreSQL, and Socket.io.

      ## Features
      - **User Authentication**: JWT-based secure authentication
      - **Team Management**: Role-based team management with captains, managers, and players
      - **Player Management**: Comprehensive player profiles and availability tracking
      - **Match Scheduling**: Team availability and match request system
      - **Live Scoring**: Real-time ball-by-ball scoring with WebSocket updates
      - **Statistics**: Automatic calculation of player and team statistics

      ## Authentication
      Most endpoints require JWT authentication. Use the \`/auth/login\` endpoint to obtain an access token, then include it in the Authorization header:
      \`Authorization: Bearer <your-jwt-token>\`

      ## Response Format
      All API responses follow a standard format:
      \`{ "success": boolean, "statusCode": number, "data": object, "message": string, "timestamp": string }\`

      ## Error Handling
      Errors follow the format:
      \`{ "success": false, "statusCode": number, "message": string, "timestamp": string, "path": string }\`

      ## Security
      - Passwords are hashed using bcrypt (10 rounds)
      - JWT tokens expire after 24 hours
      - All inputs are validated and sanitized
      - User enumeration attacks are prevented

      **Version**: 1.0.0
      **Author**: Arunachalamani G
      **Tech Stack**: NestJS | TypeORM | PostgreSQL | Socket.io
    `)
        .setVersion('1.0.0')
        .addTag('Authentication', 'User registration, login, and profile management')
        .addTag('Teams', 'Team creation, management, and role assignments')
        .addTag('Players', 'Player management and availability tracking')
        .addTag('Matches', 'Match scheduling, requests, and management')
        .addTag('Live Scoring', 'Real-time ball-by-ball match scoring')
        .addTag('Statistics', 'Player and team statistics')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token obtained from /auth/login',
        in: 'header',
    }, 'JWT-auth')
        .addServer('http://localhost:3000', 'Development Server')
        .addServer('http://api.strikerate.com', 'Production Server')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: 'list',
            filter: true,
            showRequestHeaders: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai',
            },
        },
        customSiteTitle: 'Strikerate API Docs',
    });
}
//# sourceMappingURL=swagger.config.js.map