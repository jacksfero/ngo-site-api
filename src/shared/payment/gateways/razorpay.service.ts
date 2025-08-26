// gateways/razorpay.service.ts
import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async initiate(dto: any) {
    const order = await this.razorpay.orders.create({
      amount: dto.amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `order_rcptid_${dto.orderId}`,
    });

    return {
      gateway: 'Razorpay',
      orderId: order.id,
      txnId: order.id,
      amount: dto.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  async handleCallback(body: any) {
    // Verify signature logic here
    return { success: true, body };
  }
}
