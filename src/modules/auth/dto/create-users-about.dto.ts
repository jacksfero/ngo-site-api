// create-users-about.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUsersAboutDto {

  
  @IsString()
  about: string;

  @IsString()
  awards: string;

  @IsString()
  shows: string;

  @IsString()
  exhibition: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}


import { PartialType } from '@nestjs/mapped-types';
 
export class UpdateUsersAboutDto extends PartialType(CreateUsersAboutDto) {}
