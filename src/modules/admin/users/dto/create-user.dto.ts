import {
  IsArray,
  MinLength,
  IsString,
  IsOptional,
  IsInt,
  IsEmail,
  IsNumber, IsBoolean
} from 'class-validator';
import { IsValidPassword } from 'src/core/decorators/password.decorator';
import { IsNull } from 'typeorm';

export class CreateUserDto {
 
  @IsEmail()
  email: string;

  @IsString()
  mobile: string;

  @IsString()
  name: string;

  @IsString()
  @IsValidPassword()
  password: string;
 
  @IsOptional()
  @IsBoolean()
  status?: boolean;
 
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
 
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];



}
