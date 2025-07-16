import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwtSecretKey', // use env var!
    });
  }

  /* async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }*/

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload; // 👈 This becomes req.user
  }
}
