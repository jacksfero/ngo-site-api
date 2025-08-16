// reset-password.dto.ts
import { BasePasswordDto } from './base-password.dto';
import { IsString } from 'class-validator';

export class ResetPasswordDto extends BasePasswordDto {
  @IsString()
  resetToken: string;
}
