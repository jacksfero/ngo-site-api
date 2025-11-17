// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaymentFailedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderUpdateAdminListener {
  private readonly logger = new Logger(OrderUpdateAdminListener.name);


  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService

  ) {}

  @OnEvent('order.update', { async: true })
  async handleUpdateOrderStatus(payload: OrderPaymentFailedPayload) {

    if (this.configService.get('MAIL_ENABLED') !== 'true') {
      this.logger.warn(`🚫 Mail disabled. update Order email not sent to ${payload.to}`);
      return;
    }

    this.logger.log(`📦   order Failed event received for: ${payload.totalAmount}`);
    let template = 'Order_Status_Change_Mailer';
    let subject = `Update on Your Order  #${payload.orderId}`;
    const cc = ['indigalleria@gmail.com'];
    //  const bcc = ['indigalleria@gmail.com'];
    // const to = payload.to;
    const to = 'jayprakash005@gmail.com';

    if (payload.paymentStatus === 'SUCCESS' && payload.orderStatus === 'shipped') {
      template = 'Order_Mailer_Shipped';
      subject = `Update on Your Order  ${payload.orderId}`;
    } else if (payload.paymentStatus === 'SUCCESS' && payload.orderStatus === 'delivered') {
      template = 'Order_Mailer_Delivered';
      subject = `Your Artwork is Delivered!  ${payload.orderId}`;
    }


    try {
      await this.mailService.sendTemplateEmail({
        to,
        cc,
        //  bcc,
        subject,
        template,
        context: payload,
      });

      this.logger.log(`✅ Order Failed email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send product creation email`, error);
    }
  }
}
