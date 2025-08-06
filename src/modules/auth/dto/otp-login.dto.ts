import { IsString, IsIn, Length } from 'class-validator';

  export class OtpLoginDto {
    @IsString()
    identifier: string; // email or mobile

    @IsString()
    @Length(6, 6)
    otp: string;

    @IsIn(['email', 'mobile'])
    type: 'email' | 'mobile';
  }
