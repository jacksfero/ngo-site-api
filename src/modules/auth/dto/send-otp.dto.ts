// dto/send-otp.dto.ts
export class SendOtpDto {
    identifier: string; // email or mobile
    type: 'email' | 'mobile';
    userType?: string;
  }