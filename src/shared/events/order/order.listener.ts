// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaymentFailedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class OrderListener {
  private readonly logger = new Logger(OrderListener.name);
     
  constructor(private readonly mailService: MailService) {}

  @OnEvent('order.payment.failed', { async: true })
  async handleProductCreated(payload: OrderPaymentFailedPayload) {
      this.logger.log(`📦 Product created event received for: ${payload.totalAmount}`);
      const template = 'Failed_Payment_Mailer_with_Order'; // ✅ Constant template name
      const cc = ['info@indigalleria.com'];
      const bcc = ['indigalleria@gmail.com'];
     // const to = payload.to;
     const to = 'jayprakash005@gmail.com'
      const subject = `Payment Failed for Your Order ${payload.orderId}`;
  
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
