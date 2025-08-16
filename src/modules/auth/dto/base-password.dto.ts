import { IsValidPassword } from "src/core/decorators/password.decorator";

// base-password.dto.ts
export class BasePasswordDto {
    @IsValidPassword()
    password: string;
  }
  