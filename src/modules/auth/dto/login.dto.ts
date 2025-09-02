import { IsNotEmpty,IsString,MinLength,MaxLength } from "class-validator";
import { IsValidPassword } from "src/core/decorators/password.decorator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    loginId: string;
  
    @IsNotEmpty()
    @IsString()
    @IsValidPassword()
    password: string;
  }