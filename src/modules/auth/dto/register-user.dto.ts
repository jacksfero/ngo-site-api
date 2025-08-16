// src/auth/dto/register-user.dto.ts

import { IsEmail, IsOptional, IsMobilePhone, IsString, MinLength } from 'class-validator';
import { IsValidPassword } from 'src/core/decorators/password.decorator';

export class RegisterUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsMobilePhone() // or @IsMobilePhone('en-IN')
  mobile: string;

  @IsString()
 // @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsValidPassword()
  password: string;
 
  @IsOptional()
  @IsString()
  userType?: string; // e.g. "artist", "seller", "buyer"

  @IsOptional()
  @IsString()
  captcha?: string; // Optional: handle externally if needed
}
