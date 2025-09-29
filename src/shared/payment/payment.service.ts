
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


@Injectable()
export class PaymentService {

 constructor(
  @InjectRepository(Payment)
  private readonly paymentRepo: Repository<Payment>,

   @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,   // ✅ add this

  private readonly payuService: PayUMoneyService,

  private readonly razorService: RazorpayService,

  private readonly paypalService: PaypalService,
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

}





  /**
    * Step 1: Initiate a payment
    */
  /*
 async initiatePayment(orderId: number, userId: number, amount: number, productName: string, email: string, phone: string) {
  const txnid = 'TXN' + new Date().getTime();

  // hash string format => key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const hashString = `${this.merchantKey}|${txnid}|${amount}|${productName}|${userId}|${email}|||||||||||${this.merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  // Save Payment record
  const payment = this.paymentRepo.create({
    orderId,
    userId,
    amount,
    txnId: txnid,
    status: 'pending',
    paymentGateway: 'PayUMoney',
  });
  await this.paymentRepo.save(payment);

  // Response for frontend (to redirect to PayUMoney)
  return {
    action: 'https://secure.payu.in/_payment', // or sandbox: https://test.payu.in/_payment
    params: {
      key: this.merchantKey,
      txnid,
      amount,
      productinfo: productName,
      firstname: String(userId),
      email,
      phone,
      surl: this.successUrl,
      furl: this.failureUrl,
      hash,
    },
  };
}
*/
  /**
   * Step 2: Handle Callback
   */
  /*
  async handleCallback(body: any) {
    const { txnid, status, hash, ...rest } = body;
  
    // Verify hash
    const reverseHashStr = `${this.merchantSalt}|${status}|||||||||||${rest.email}|${rest.firstname}|${rest.productinfo}|${rest.amount}|${txnid}|${this.merchantKey}`;
    const expectedHash = crypto.createHash('sha512').update(reverseHashStr).digest('hex');
  
    if (expectedHash !== hash) {
      throw new Error('Invalid hash from PayUMoney!');
    }
  
    // Update Payment
    await this.paymentRepo.update({ txnId: txnid }, {
      status,
      gatewayResponse: body,
    });
  
    return { message: `Payment ${status}`, txnid };
  }
  */
  /**
   * (Optional) Verify transaction from PayUMoney API
   */
  /*
  async verifyTransaction(txnId: string) {
    const response = await axios.post(
      'https://www.payumoney.com/payment/op/getPaymentResponse',
      { merchantKey: this.merchantKey, merchantTransactionIds: txnId },
      { headers: { Authorization: `Bearer ${process.env.PAYUMONEY_AUTH_HEADER}` } },
    );
  
    return response.data;
  }
   
    
      generatePaymentUrl(paymentDto: PaymentRequestDto) {
        const { txnId, amount, productInfo, firstName, email, phone } = paymentDto;
    
        // ✅ Hash sequence
        const hashString = `${this.key}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${this.salt}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
        // ✅ PayU endpoint
        const payuUrl = `${this.baseUrl}/_payment`;
    
        return {
          action: payuUrl,
          params: {
            key: this.key,
            txnid: txnId,
            amount,
            productinfo: productInfo,
            firstname: firstName,
            email,
            phone,
            surl: process.env.PAYU_SUCCESS_URL,
            furl: process.env.PAYU_FAILURE_URL,
            hash,
          },
        };
      }
    
      // ✅ Callback validation
      verifyPayment(response: any) {
        const { key, txnid, amount, productinfo, firstname, email, status, hash } =
          response;
    
        const hashSequence = `${this.salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const expectedHash = crypto
          .createHash('sha512')
          .update(hashSequence)
          .digest('hex');
    
        return hash === expectedHash;
      }
     
    */




