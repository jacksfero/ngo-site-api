import { BadRequestException,Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto'; // adjust the path to your LoginDto
import { Request } from 'express';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginId',
      passwordField: 'password',
      passReqToCallback: true,   // ⭐ MUST HAVE
    });

    console.log('LocalStrategy loaded');
  }

  async validate(req: Request, loginId: string, password: string): Promise<any> {
    if (!loginId || !password) {
      throw new BadRequestException('Login ID and password are required');
    }

    const dto = plainToInstance(LoginDto, { loginId, password });
    const errors = await validate(dto);

    if (errors.length > 0) {
      const message = errors
        .map(err => Object.values(err.constraints ?? {}).join(', '))
        .join(', ');
      throw new BadRequestException(`Validation failed: ${message}`);
    }

    const user = await this.authService.validateUser(loginId, password, req);
    if (!user) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    return user;
  }
}

