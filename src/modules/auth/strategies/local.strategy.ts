import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { LoginDto } from '../login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginId' }); // 👈 Accepts "email or mobile"
  }

  async validate(dto:LoginDto): Promise<any> {
    //const {loginId, password} = dto;
    const user = await this.authService.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException('Login Failed -- validate user');
    }
    return user;
  }
}
