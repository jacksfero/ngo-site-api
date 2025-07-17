// assign-roles.dto.ts
import { IsArray, IsNumber } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @IsNumber({}, { each: true }) // Validate each array element is number
  roleIds: number[];
}