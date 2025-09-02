import { BadRequestException,Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto'; // adjust the path to your LoginDto


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginId',
      passwordField: 'password',
    });

    console.log('✅ LocalStrategy initialized with AuthService:--------', !!authService);
  }
 
  async validate(loginId: string, password: string): Promise<any> {

     // ✅ Add input validation
     if (!loginId || !password) {
      throw new BadRequestException('Login ID and password are required');
    }


    // Step 1: Convert to DTO
     const dto = plainToInstance(LoginDto, { loginId, password });

    // Step 2: Run manual validation
    const errors = await validate(dto);
    if (errors.length > 0) {
      const message = errors
                    .map(err => Object.values(err.constraints ?? {}).join(', '))
                    .join(', ');

      throw new BadRequestException(`Validation failed: ${message}`);
    } 

    // Step 3: Proceed with user validation
    const user =  await this.authService.validateUser(loginId, password);
    if (!user) {
      throw new UnauthorizedException(`Invalid credentials for login id: ${loginId}`);
    }

    return user;
  }
}
