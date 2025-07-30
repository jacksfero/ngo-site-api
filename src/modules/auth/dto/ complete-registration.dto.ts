// dto/complete-registration.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CompleteRegistrationDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsEnum(['email', 'mobile'])
  type: 'email' | 'mobile';

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  captcha?: string; // Optional: handle externally if needed
}
