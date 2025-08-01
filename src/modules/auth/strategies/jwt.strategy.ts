import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // ✅ call super() FIRST before using configService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, // ✅ safely pulled from env
    });

    // Optional logging for debugging (will show only in logs, not throw error)
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      console.warn('⚠️ JWT_SECRET is not set in the environment');
    }
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload; // 👈 attaches to req.user
  }
}
