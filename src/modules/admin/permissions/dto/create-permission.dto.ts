import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  resource: string;

  @IsString()
  action: string;


  // roleIds is not working comment by jay
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}
