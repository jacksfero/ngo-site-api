// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductCreatedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class ProductListener {
  private readonly logger = new Logger(ProductListener.name);
     
  constructor(private readonly mailService: MailService) {}

  @OnEvent('product.created', { async: true })
  async handleProductCreated(payload: ProductCreatedPayload) {
    this.logger.log(`📦 Product created event received for: ${payload.productName}`);
    const template = 'Artwork-Submission-Mailer'; // ✅ Constant template name
    const cc = ['info@indigalleria.com'];
    const bcc = ['indigalleria@gmail.com'];
   // const to = payload.to;
   const to = 'jayprakash005@gmail.com'
    const subject = `Artwork Submission Received | IndiGalleria`;

    try {
      await this.mailService.sendTemplateEmail({
        to: payload.to,
        cc,
        bcc,
        subject ,
        template,
        context: payload,
      });

      this.logger.log(`✅ Product creation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send product creation email`, error);
    }
  }
}
