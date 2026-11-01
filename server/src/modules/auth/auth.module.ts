import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { OtpController } from './otp.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { GoogleAuthService } from './google.auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { User } from '../user/user.entity';
import { Otp } from './otp.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Otp]),
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get('app.jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, OtpController],
  providers: [AuthService, OtpService, EmailService, GoogleAuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, OtpService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
