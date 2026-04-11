import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          (req: Request) => {
            if (!req) return null;
            if (req.headers?.authorization) return null;
            return req.cookies?.['access_token'] || null;
          },
        ]),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET')!,
        // ⚠️ Using { strict: true } forces Nest to throw if variable is missing
      });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    console.log(`payload------------------`,payload)
    if (!payload.sub || !payload.siteId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}


