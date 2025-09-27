import { Injectable } from '@nestjs/common';
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RLjYNYOCQ9UFUt',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'jFVL2nI2OiE3MHd9kGH5dBbQ',

      
    });
  }

  async initiate(dto: { amount: number; orderId: number }) {
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
    // Later: verify signature with crypto
    return { success: true, body };
  }
}
