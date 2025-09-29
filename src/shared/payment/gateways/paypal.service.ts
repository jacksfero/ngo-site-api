// gateways/paypal.service.ts
import { Injectable,Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paypal from '@paypal/checkout-server-sdk';
import { Payment, PaymentStatus } from 'src/shared/entities/payment.entity';
import { PaymentCallbackResult } from '../dto/payment-callback-result';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(

     private readonly config: ConfigService,
  ) {
 
    // const env = new paypal.core.SandboxEnvironment(
    //   process.env.PAYPAL_CLIENT_ID!,
    //   process.env.PAYPAL_CLIENT_SECRET!
    // );
    // this.client = new paypal.core.PayPalHttpClient(env);

      const isLive = process.env.PAYPAL_MODE === 'live';
    // const isLive = true;
    // const PAYPAL_CLIENT_ID = 'AUjce5Gqgl5V_mcjQ8eNj9A3xv54jZ7iWI51mobRJHuODdXW3mzmIUjA2tPxQETcqrT4dqs-y1IGFJNG';
    // const PAYPAL_CLIENT_SECRET = 'EL5pTWrsmswkbZ-ofra9Gs9db0SCFvPSV5hTs6ojC6fAUyduX0u6K8P4muDzwSDhJZ6qSlVaR1EkO8oI';

    const env = isLive
      ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!,
      )
      : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!,
      );
   // console.log('ENV variable----------', env);
    this.client = new paypal.core.PayPalHttpClient(env);
  }

  /** Step 1: Create order + store in DB */
 // async initiate(dto: { amount: number; userId: number }) {
    async initiate(dto: { amount: number }) {
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
      application_context: {
       // return_url: `${process.env.API_BASE_URL}/payment/paypal/success`,
       // cancel_url: `${process.env.API_BASE_URL}/payment/paypal/cancel`,
         return_url: this.successUrl,
        cancel_url: this.failureUrl ,
      },
    });

    const order = await this.client.execute(request);

    return {
      gateway: 'PayPal',
      orderId: order.result.id,
      txnId: order.result.id,
      approveLink: order.result.links.find((l) => l.rel === 'approve')?.href,
    };
  }

  private get successUrl():string {
  return `${this.config.get('API_BASE_URL')}${this.config.get('PAYPAL_SUCCESS_URL')}`;
}

private get failureUrl():string {
  return `${this.config.get('API_BASE_URL')}${this.config.get('PAYPAL_CANCEL_URL')}`;
}


async capture(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);

  // Cast to `any` to bypass overly strict typings
  request.requestBody({} as any);

  const capture = await this.client.execute(request);

  return {
    txnId: capture.result.id,
    status: capture.result.status, // e.g. COMPLETED
    amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
    currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
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
