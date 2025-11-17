import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentStatus } from 'src/shared/entities/payment.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PayUMoneyService } from './gateways/payumoney.service';
import { RazorpayService } from './gateways/razorpay.service';
import { PaypalService } from './gateways/paypal.service';
import { PaymentCallbackResult } from './dto/payment-callback-result';
import { Order, OrderStatus } from '../entities/order.entity';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderPaymentFailedPayload } from '../events/interfaces/event-payload.interface';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class PaymentService {
 private secret: string;
 
 constructor(
  private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
  
  @InjectRepository(Payment)
  private readonly paymentRepo: Repository<Payment>,

   @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,   // ✅ add this

  private readonly payuService: PayUMoneyService,

  private readonly razorService: RazorpayService,

  private readonly paypalService: PaypalService,

  private readonly configService: ConfigService,   // ✅ Add this
) {}

  private merchantKey = process.env.PAYUMONEY_KEY;
  private merchantSalt = process.env.PAYUMONEY_SALT;
  private successUrl = process.env.PAYUMONEY_SUCCESS_URL;
  private failureUrl = process.env.PAYUMONEY_FAILURE_URL;


  async initiatePayments(dto: InitiatePaymentDto) {
    let result;

    switch (dto.gateway) {
      case 'PayUMoney':
        result = await this.payuService.initiate(dto);
        break;
      case 'Razorpay':
        result = await this.razorService.initiate(dto);
        break;
      case 'PayPal':
        result = await this.paypalService.initiate(dto);
        break;
      default:
        throw new Error('Unsupported payment gateway');
    }

    // ✅ Save payment record using txnId returned from gateway service
    // Save PENDING payment in DB
  const payment = this.paymentRepo.create({
    orderId: dto.orderId,
    userId: dto.userId,
    amount: dto.amount,
    paymentGateway: dto.gateway,
    status: PaymentStatus.PENDING,
    txnId: result.txnId,
  });

    await this.paymentRepo.save(payment);

    return result;
  }

async handleCallbacks(gateway: string, body: any): Promise<PaymentCallbackResult> {
  switch (gateway) {
    case 'PayUMoney':
      return this.payuService.handleCallback(body);
    case 'Razorpay':
      return this.razorService.handleCallback(body);
    case 'PayPal':
      return this.paypalService.handleCallback(body);
    default:
      throw new Error('Unsupported payment gateway');
  }
}

async confirmPaypalPayment(orderId: string) {
  const capture = await this.paypalService.capture(orderId);

 
   // ✅ Update payment in DB
  const payment = await this.paymentRepo.findOne({
    where: { txnId: capture.txnId },
    relations: ['order'], // load order relation
  });

    if (!payment) throw new Error('Payment not found!');

  payment.status = PaymentStatus.SUCCESS;
  await this.paymentRepo.save(payment);

    // ✅ Update linked order
  const order = payment.order;
  order.updatePaymentStatus(payment);
  order.status = OrderStatus.CONFIRMED;
  await this.orderRepo.save(order);

   return { ...capture, orderId: order.id };
}

/** Step 3: Cancel handler */
  async PaypalCancel(token: string) {

     const payment = await this.paymentRepo.findOne({
    where: { txnId: token },
    relations: ['order'],
  });

  if (!payment) {
    return { success: false, status: 'CANCELLED', txnId: token };
  }

   payment.status = PaymentStatus.FAILED;
  await this.paymentRepo.save(payment);

  const order = payment.order;
  order.updatePaymentStatus(payment);
  order.status = OrderStatus.CANCELLED;
  order.cancelledAt = new Date();
  await this.orderRepo.save(order);

  return { success: false, status: 'CANCELLED', txnId: token, orderId: order.id  };
}

async handleWebhook(body: any, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    throw new Error('Invalid Razorpay Webhook Signature');
  }

  const event = body.event;
  const paymentEntity = body.payload?.payment?.entity;

  const payment = await this.paymentRepo.findOne({
    where: { txnId: paymentEntity.order_id },
    relations: ['order'],
  });
if (!payment) return { success: false };

const userdetails = await this.authService.getUserDetailsById(payment.userId);
const order = payment.order;
const items = order.items.map((item) => ({
  productName: item.productName,
  // quantity: item.quantity,
  // price: String(item.price),
  // total: String(item.price * item.quantity),
  // image: item.imageUrl, // if exists
}));
  if (payment) {
    if (event === 'payment.captured') {
      payment.status = PaymentStatus.SUCCESS;
      payment.gatewayResponse = paymentEntity;
      payment.gatewayPaymentId = paymentEntity.id;
       
    } else if (event === 'payment.failed') {
      payment.status = PaymentStatus.FAILED;  
     
    }
     // Notify user (payment failed)
   /** Start Mail Service */
   const date = new Date(payment.createdAt);

const formattedDateTime =
  date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/,/g, '') +
  ' at ' +
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
            const payload: OrderPaymentFailedPayload = {  
        context: {   
        },   
        orderId:  String (payment.orderId),
        currency:String (payment.currency),
         totalAmount: String(payment.amount),  
         orderDate:String(formattedDateTime),
         paymentGatway:payment.paymentGateway,
         paymentStatus:payment.status,orderStatus:'Pending',
         name: userdetails.username,
         to: userdetails.email, 
          items,
       // testingNote: 'Testing product update flow',
      };
      this.eventEmitter.emit('order.payment.failed', payload);     
      /** End Mail Service */
    await this.paymentRepo.save(payment);

    if (payment.order) {
      payment.order.paymentStatus = payment.status;
      if (payment.status === PaymentStatus.SUCCESS) {
        payment.order.status = OrderStatus.CONFIRMED;
      } else if (payment.status === PaymentStatus.FAILED) {
        payment.order.status = OrderStatus.FAILED;
      }
      await this.orderRepo.save(payment.order);
    }
  }

  return { success: true };
}

 

async handleCallbackRazor(body: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error('Invalid Razorpay callback data');
  }

  // ✅ Verify signature

  const secret = this.configService.get<string>('razorpay.secret');
if (!secret) {
  throw new Error('Razorpay secret not configured in env');
}


 const sign = crypto
  .createHmac('sha256', secret)
  .update(razorpay_order_id + '|' + razorpay_payment_id)
  .digest('hex');


if (sign !== razorpay_signature) {
    throw new Error('Signature mismatch');
  }

  // Update Payment to SUCCESS (temporary confirmation)
  const payment = await this.paymentRepo.findOne({
    where: { txnId: razorpay_order_id },
    relations: ['order'],
  });

    if (!payment) throw new Error('Payment record not found');

 /* if (payment) {
    payment.status = PaymentStatus.SUCCESS;
    payment.gatewayPaymentId = razorpay_payment_id;
     payment.gatewayResponse = body;
    await this.paymentRepo.save(payment);

    // Also update Order
    if (payment.order) {
      payment.order.paymentStatus = PaymentStatus.SUCCESS;
      payment.order.status = OrderStatus.CONFIRMED;
      await this.orderRepo.save(payment.order);
    }
  }*/
return { success: true, txnId: razorpay_payment_id };
 // return { success: true, message: 'Payment verified (callback)' };
}

/*
async handleRazorpayWebhook(body: any, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // Verify webhook signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    throw new Error('Invalid Razorpay Webhook Signature');
  }

  // Normalize response
  const event = body.event;
  const payload = body.payload?.payment?.entity;

  let status = 'PENDING';
  if (event === 'payment.captured') status = 'SUCCESS';
  if (event === 'payment.failed') status = 'FAILED';

  // ✅ Update DB
  const payment = await this.paymentRepo.findOne({
    where: { txnId: payload.id },
    relations: ['order'],
  });

  if (payment) {
    payment.status = status as any;
    await this.paymentRepo.save(payment);

    if (payment.order) {
      payment.order.paymentStatus = payment.status;
      if (status === 'SUCCESS') {
        payment.order.status = 'CONFIRMED';
      }
      await this.orderRepo.save(payment.order);
    }
  }

  return { success: true };
}
*/

}




