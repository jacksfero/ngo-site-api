// dto/verify-otp.dto.ts
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // Email or Mobile

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsEnum(['email', 'mobile'])
  type: 'email' | 'mobile';
}
/*
{
  "identifier": "someone@example.com",
  "otp": "123456",
  "type": "email"
}*/