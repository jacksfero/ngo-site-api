// dto/verify-otp.dto.ts
import { IsNotEmpty,IsOptional,IsEnum, IsString, Length, IsIn } from 'class-validator';
import { OtpType, UserType } from './start-verification.dto';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string;

  @IsEnum(OtpType)
  type: OtpType;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType; // e.g., 'Login', 'Registration'
}
/*
{
  "identifier": "someone@example.com",
  "otp": "123456",
  "type": "email"
}*/