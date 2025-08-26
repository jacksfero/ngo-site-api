// gateways/paypal.service.ts
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const env = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!     
    );
    this.client = new paypal.core.PayPalHttpClient(env);
  }

  async initiate(dto: any) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: dto.amount.toFixed(2),
          },
        },
      ],
    });

    const order = await this.client.execute(request);

    return {
      gateway: 'PayPal',
      orderId: order.result.id,
      txnId: order.result.id,
      approveLink: order.result.links.find((l) => l.rel === 'approve')?.href,
    };
  }

  async handleCallback(body: any) {
    // You’ll call PayPal API to capture payment here
    return { success: true, body };
  }
}
