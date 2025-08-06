import { IsString,IsEnum, IsOptional } from "class-validator";
import { UserType,OtpType } from "./start-verification.dto";

// dto/send-otp.dto.ts
export class SendOtpDto {

    @IsString()
    identifier: string; // email or mobile

    @IsEnum(OtpType)
    type: OtpType;

    @IsOptional()
    @IsEnum(UserType)
    userType?: string;
  }