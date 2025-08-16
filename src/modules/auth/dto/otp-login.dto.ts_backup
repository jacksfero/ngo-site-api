import { IsString,IsEnum, IsIn, Length } from 'class-validator';
import { OtpType } from './start-verification.dto';

  export class OtpLoginDto {
    @IsString()
    identifier: string; // email or mobile

    @IsString()
    @Length(6, 6)
    otp: string;

    @IsEnum(OtpType)
    type: OtpType;
  }
