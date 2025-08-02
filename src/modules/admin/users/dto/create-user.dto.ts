import {
  IsArray,
  MinLength,
  IsString,
  IsOptional,
  IsInt,
  IsEmail,
  IsNumber,IsBoolean
} from 'class-validator';

export class CreateUserDto {
   @IsOptional()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

   @IsNumber()
  mobile: string;

  @IsString()
  @MinLength(6)
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
