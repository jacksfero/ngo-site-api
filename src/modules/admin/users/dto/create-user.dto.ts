import {
  IsArray,
  MinLength,
  IsString,
  IsOptional,
  IsInt,
  IsEmail,
  IsNumber,IsBoolean
} from 'class-validator';
import { IsValidPassword } from 'src/core/decorators/password.decorator';

export class CreateUserDto {
   @IsOptional()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  mobile: string; 
  
  @IsOptional()
  @IsString()
  phonecode?: string;

  @IsString()
  @IsValidPassword()
  password: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
  
  @IsOptional()
  @IsBoolean()
  featured_artist?: boolean;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  profileEdit?: boolean;

  @IsOptional()
  @IsBoolean()
  homePageDisplay?: boolean;

  @IsOptional()
  @IsString()
  adminRemark?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];

  @IsOptional()
  //@IsArray()
  @IsInt()
  artist_type_id?: number;
}
