import { IsArray, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(3, 20)
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionsIds: number[];
}
