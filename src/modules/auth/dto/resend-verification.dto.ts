// src/auth/dto/resend-verification.dto.ts

import { IsEmail,IsOptional,IsString, IsMobilePhone, ValidateIf } from 'class-validator';

export class ResendOtpDto {
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsMobilePhone() // or @IsMobilePhone('en-IN')
  mobile?: string;

  @IsOptional()
  @IsString()       
  userType?: string; // Optionally include userType if needed
}
/*
import { IsEmail, IsMobilePhone, ValidateIf, IsOptional, IsString } from 'class-validator';

export class ResendOtpDto {
  @ValidateIf(o => !o.mobile)
  @IsEmail()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsMobilePhone() // you can pass locale like 'en-IN' if needed
  mobile?: string;

  @IsOptional()
  @IsString()
  userType?: string;
}*/