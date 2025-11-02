// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OtpCreatedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class OtpListener {
  private readonly logger = new Logger(OtpListener.name);
     
  constructor(private readonly mailService: MailService) {}

  @OnEvent('otp.send', { async: true })
  async handleOtpCreated(payload: OtpCreatedPayload) {
    this.logger.log(`📦 Otp created event received for: ${payload.to}`);
    const template = 'email_verification_mailer'; // ✅ Constant template name
    const cc = ['info@indigalleria.com'];
    const bcc = ['indigalleria@gmail.com'];


    try {
      // await this.mailService.sendTemplateEmail({
      //   to: payload.to,
      //    cc,
      //   bcc,
      //   subject: payload.subject,
      //   template,
      //   context: payload,
      // });
      console.log('OTP creation email sent to-----------------')
      this.logger.log(`✅ OTP creation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP creation email`, error);
    }
  }
}
