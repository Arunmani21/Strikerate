import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('app.jwt.secret'),
    });
  }

  async validate(payload: any) {
    const { userId, email } = payload;

    // Verify user still exists
    const user = await this.dataSource
      .getRepository('User')
      .findOne({ where: { id: userId, email } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: user.id, email: user.email, name: user.name };
  }
}
