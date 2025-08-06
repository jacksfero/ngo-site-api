// src/auth/dto/resend-verification.dto.ts

import { IsEmail,IsEnum,IsOptional,IsString, IsMobilePhone, ValidateIf } from 'class-validator';
import { UserType } from './start-verification.dto';

export class ResendOtpDto {
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsMobilePhone() // or @IsMobilePhone('en-IN')
  mobile?: string;

  @IsOptional()
  @IsEnum(UserType)       
  userType?: UserType; // Optionally include userType if needed
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