// gateways/paypal.service.ts
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import { PaymentStatus } from 'src/shared/entities/payment.entity';
import { PaymentCallbackResult } from '../dto/payment-callback-result';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    // const env = new paypal.core.SandboxEnvironment(
    //   process.env.PAYPAL_CLIENT_ID!,
    //   process.env.PAYPAL_CLIENT_SECRET!
    // );
    // this.client = new paypal.core.PayPalHttpClient(env);

     const isLive = process.env.PAYPAL_MODE === 'live';
  const   PAYPAL_CLIENT_ID = 'AUjce5Gqgl5V_mcjQ8eNj9A3xv54jZ7iWI51mobRJHuODdXW3mzmIUjA2tPxQETcqrT4dqs-y1IGFJNG';
const PAYPAL_CLIENT_SECRET = 'EL5pTWrsmswkbZ-ofra9Gs9db0SCFvPSV5hTs6ojC6fAUyduX0u6K8P4muDzwSDhJZ6qSlVaR1EkO8oI';

    const env = isLive
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID??PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET??PAYPAL_CLIENT_SECRET,
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_CLIENT_SECRET!,
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

  async handleCallback(body: any): Promise<PaymentCallbackResult> {
    // ⚡ In real world: Call PayPal API to capture payment
    const txnId = body?.orderId || body?.txnId || 'unknown';

    return {
      success: true,
      txnId,
      amount: Number(body?.amount) || undefined,
      status: PaymentStatus.SUCCESS, // Or FAILED based on PayPal response
      raw: body,
    };
  }
}
