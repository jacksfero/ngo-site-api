// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {  ResetPassCreatedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResetPasswordListener {
  private readonly logger = new Logger(ResetPasswordListener.name);
     
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService) {
 //console.log('rest pass mail sent')

    }
   
  @OnEvent('reset_password.send', { async: true })
async handleResetPasswordCreated(payload: ResetPassCreatedPayload) {
 //console.log('-----------rest pass mail sent')
  if (this.configService.get('MAIL_ENABLED') !== 'False_true') {
    this.logger.warn(`🚫 Mail disabled. Reset password email not sent to ${payload.to}`);
    return;
  }

  this.logger.log(`📦 Password reset email event received for: ${payload.to}`);

  const template = 'Password_Reset_Confirmation_Mailer';
  const subject = `Password Reset Confirmation`;

  try {
    await this.mailService.sendTemplateEmail({
      to: payload.to,
      subject,
      template,
      context: payload,
    });

    this.logger.log(`✅ Password reset email sent to ${payload.to}`);

  } catch (error) {
    this.logger.error(`❌ Failed to send password reset email`, error);
  }
}

}
