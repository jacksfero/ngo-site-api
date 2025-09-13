// create-users-about.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUsersAboutDto {
 
  @IsOptional()
  @IsString()
  about: string;

  @IsOptional()
  @IsString()
  awards: string;

  @IsOptional()
  @IsString()
  shows: string;

  @IsOptional()
  @IsString()
  exhibition: string;

  @IsOptional()
  @IsString()
  meta_desc: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
