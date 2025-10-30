// src/events/mail/mail.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('mail.send') // <-- listens for all `mail.send` events
  async handleMailSend(payload: any) {
    this.logger.log(`📧 Mail event triggered for ${payload.to}`);
    try {
      await this.mailService.sendTemplateEmail(payload);
      this.logger.log(`✅ Email sent successfully to ${payload.to}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send email: ${err.message}`);
    }
  }
}
