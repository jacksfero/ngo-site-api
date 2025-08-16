import { IsString } from "class-validator";
 
import { BasePasswordDto } from "./base-password.dto";

 

export class ChangePasswordDto extends BasePasswordDto {
  @IsString()
  oldPassword: string;
}
