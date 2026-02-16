// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OtpCreatedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpListener {
  private readonly logger = new Logger(OtpListener.name);
     
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService) {}

  @OnEvent('otp.send', { async: true })
  async handleOtpCreated(payload: OtpCreatedPayload) {
      // ✅ Check if mail is disabled
   if (this.configService.get('MAIL_ENABLED') !== 'true') {
    this.logger.warn(`🚫 Mail disabled. OTP email not sent to ${payload.to}`);
    return;
  }

    this.logger.log(`📦 Otp created event received for: ${payload.to}`);
   let template = 'email_verification_mailer';
  let subject = `Your IndiGalleria Email Verification Code ${payload.otp}`;
  let from = this.configService.get('SES_FROM_INFO_EMAIL')
  if (payload.type === 'forgot_password') {
    template = 'Reset_Password_Mailer';
    subject = ` Reset Your IndiGalleria Password`;
  }

   try {
    await this.mailService.sendTemplateEmail({
      to: payload.to,
      subject,
      template,
      context: payload,
      from
    });

 
      console.log('OTP creation email sent to-----------------')
      this.logger.log(`✅ OTP creation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP creation email`, error);
    } 
  }
}
