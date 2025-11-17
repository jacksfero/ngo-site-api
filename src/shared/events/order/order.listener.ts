// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaymentFailedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderListener {
  private readonly logger = new Logger(OrderListener.name);
  
     
  constructor(
     private readonly configService: ConfigService,
    private readonly mailService: MailService
    
  ) {}

  @OnEvent('order.payment.failed', { async: true })
  async handleProductCreated(payload: OrderPaymentFailedPayload) {

if (this.configService.get('MAIL_ENABLED') !== 'true') {
   this.logger.warn(`🚫 Mail disabled. Reset password email not sent to ${payload.to}`);
   return;
  }

      this.logger.log(`📦   order Failed event received for: ${payload.totalAmount}`);
      let template = 'Failed_Payment_Mailer_with_Order';  
         
       const cc = ['indigalleria@gmail.com'];
    //  const bcc = ['indigalleria@gmail.com'];
     // const to = payload.to;
     const to = 'jayprakash005@gmail.com';
      let subject = `Payment Failed for Your Order ${payload.orderId}`;
   if (payload.paymentStatus === 'SUCCESS') {
      template = 'Successful_Payment_Mailer_with_Order';
       subject = `Payment Successful for Your Order ${payload.orderId}`;
   }

  
      try {
        await this.mailService.sendTemplateEmail({
          to,
           cc,
        //  bcc,
          subject ,
          template,
          context: payload,
        });
  
        this.logger.log(`✅ Order Failed email sent to ${payload.to}`);
      } catch (error) {
        this.logger.error(`❌ Failed to send product creation email`, error);
      }
    }
}
