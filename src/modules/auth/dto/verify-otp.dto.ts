// dto/verify-otp.dto.ts
import { IsNotEmpty,IsOptional, IsString, Length, IsIn } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;

  @IsNotEmpty()
  @IsIn(['email', 'mobile'])
  type: 'email' | 'mobile';

  @IsOptional()
  @IsString()
  userType?: string; // e.g., 'Login', 'Registration'
}
/*
{
  "identifier": "someone@example.com",
  "otp": "123456",
  "type": "email"
}*/