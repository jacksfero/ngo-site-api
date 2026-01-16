// gateways/payumoney.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/shared/entities/payment.entity';
import { PaymentStatus } from '../enum/payment-status.enum';
import { PaymentCallbackResult } from '../dto/payment-callback-result';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from 'src/shared/entities/order.entity';
import { Cart } from 'src/shared/entities/cart.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inventory } from 'src/shared/entities/inventory.entity';

@Injectable()
export class PayUMoneyService {
  private readonly logger = new Logger(PayUMoneyService.name);
  // private merchantKey = process.env.PAYU_KEY || 'Qu5Kb7';       // test/prod merchant key
  // private merchantSalt = process.env.PAYU_SALT || 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsLjkNpxdiTri198kvVohJOrGRVB1DoAzgRBmUqQmRICUrUSuC53Hj950i79dx5mHZ9jKH7Oz' ;     // test/prod salt
  // private baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in'; 
 
  private merchantKey: string;
  private merchantSalt: string;
  private baseUrl: string;

  constructor(
     private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
  ) {
    this.merchantKey = this.config.get<string>('payu.key')!;
    this.merchantSalt = this.config.get<string>('payu.salt')!;
    this.baseUrl = this.config.get<string>('payu.baseUrl')!;
  }

  async initiate(dto: {
    amount: number;
    productName: string;
    fullName: string;
    email: string;
    phone: string;
    userId: number;
  }) {
    const txnId = this.generateTxnId();
    const productInfo = dto.productName || 'Order Payment';

    // Format amount to 2 decimal places (CRITICAL!)
    const formattedAmount = dto.amount.toFixed(2);

    // Build hash string EXACTLY as PayU expects
    // Formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${this.merchantKey}|${txnId}|${formattedAmount}|${productInfo}|${dto.fullName}|${dto.email}|||||||||||${this.merchantSalt}`;

    // console.log('HashString for verification:', hashString);

    // ❌ WRONG: PayU expects only SHA512 hash, not JSON format
    // PayU does NOT expect v1/v2 format - just a single SHA512 hash
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // console.log('Generated Hash:', hash);

    return {
      gateway: 'PayUMoney',
      txnId,
      // payuUrl: `${this.baseUrl}/_payment`,
      payuUrl: `${this.baseUrl}`,
      params: {
        key: this.merchantKey,
        txnid: txnId,
        amount: formattedAmount,
        productinfo: productInfo,
        firstname: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        surl: this.surl,
        furl: this.furl,
        hash: hash, // ✅ CORRECT: Send plain hash string, not JSON
        // Include empty UDF parameters (these are already handled in hash string)
        udf1: '',
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: '',
      },
    };
  }


  /** 🔹 Handle callback from PayUMoney */
  async handleCallback(body: any): Promise<PaymentCallbackResult> {
    const { key, txnid, amount, productinfo, firstname, email, status, hash } = body;
    //console.log('-------Body----------',body)
    const hashString = `${this.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== hash) {
      await this.updatePayment(txnid, PaymentStatus.FAILED, { reason: 'Hash mismatch' });
      return {
        success: false,
        txnId: txnid,
        status: PaymentStatus.FAILED,
        message: 'Hash mismatch',
        raw: body,
      };
    }

    const newStatus = status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    const payment = await this.updatePayment(txnid, newStatus, body);

    return {
      success: newStatus === PaymentStatus.SUCCESS,
      txnId: txnid,
      amount: Number(amount),
      status: newStatus,
      raw: body,
    };
  }


  /** 🔹 Update Payment in DB */
  private async updatePayment(txnId: string, status: PaymentStatus, meta?: any) {
    const payment = await this.paymentRepo.findOne({
      where: { txnId },
      //  relations: ['order'], // needed to update order
      relations: ['order', 'order.user', 'order.items'],
    });

    if (!payment) throw new Error(`Payment not found for txnId: ${txnId}`);

    payment.status = status;
    payment.failureReason = meta.error_Message ?? null;
    payment.gatewayResponse = meta || {};;
    (payment as any).meta = meta || {}; // only if you have `meta` column
    await this.paymentRepo.save(payment);
    const order = payment.order;
    const user = order?.user;

    if (order) {
      let orderstatus_mail = 'Cancelled';


      if (status === PaymentStatus.SUCCESS) {
        order.status = OrderStatus.CONFIRMED; // or PAID, depending on your design
        orderstatus_mail = 'Under Process';
        // 2️⃣ ✅ Close Cart
        if (user) {
          await this.cartRepo.update(
            { user: { id: user.id }, isCheckedOut: false },
            { isCheckedOut: true }
          );
          this.logger.log(`🛒 PayU: Cart closed for user: ${user.id}`);
        }

      } else {
        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        orderstatus_mail = 'Cancelled';
        // 3️⃣ ✅ Restore Inventory on Failure
        if (order.items) {
          for (const item of order.items) {
            await this.inventoryRepo.increment({ id: item.inventoryId }, 'quantity', item.quantity);
          }
        }
         order.updatePaymentStatus(payment);
        await this.orderRepo.save(order);
      }
      // 4️⃣ ✅ EMIT EMAIL EVENT
    if (user) {
      const emailPayload = this.buildEmailPayload(payment, user, order, orderstatus_mail);
      this.eventEmitter.emit('order.payment.failed', emailPayload);
    }
  }
      return payment;
    }

/** 🔹 Helper to build the standard Email Payload */
private buildEmailPayload(payment, user, order, orderstatus_mail) {
  const date = new Date(payment.createdAt);
  const formattedDateTime = date.toLocaleDateString('en-GB', { 
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
  }) + ' at ' + date.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });

  return {
    orderId: String(order.id),
    currency: String(payment.currency || 'INR'),
    totalAmount: String(payment.amount),
    orderDate: formattedDateTime,
    paymentGatway: 'PayU',
    paymentStatus: payment.status,
    orderStatus: orderstatus_mail,
    name: user.username,
    to: user.email,
    items: order.items?.map(i => ({ productName: i.productName })) || [],
  };
}
  private generateTxnId(): string {
    return crypto.randomBytes(16).toString('hex').substring(0, 20);
  }

  private get surl(): string {
    return `${this.config.get('API_BASE_URL')}${this.config.get('PAYUMONEY_SUCCESS_URL')}`;
  }

  private get furl(): string {
    return `${this.config.get('API_BASE_URL')}${this.config.get('PAYUMONEY_FAILURE_URL')}`;
  }


}


/** 🔹 Initiate payment */
/* async initiateaa_back(dto: {
   amount: number;
   productName: string;
   fullName: string;
   email: string;
   phone: string;
   userId: number;
 }) {
   const txnId = this.generateTxnId();
   const productInfo = dto.productName || 'Order Payment';
   const udf1 = '';
const udf2 = '';
const udf3 = '';
const udf4 = '';
const udf5 = '';
   //sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 
//  HashString------------ Qu5Kb7|030d5e02ca133730f4c9|26700.01|painting|Customer|customer@example.com|||||||||||MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsLjkNpxdiTri198kvVohJOrGRVB1DoAzgRBmUqQmRICUrUSuC53Hj950i79dx5mHZ9jKH7Oz
  
//$hash=hash('sha512', $posted['key'].'|'.$posted['txnid'].'|'.$posted['amount'].'|'.$posted['productinfo'].'|'.$posted['firstname'].'|'.$posted['email'].'|||||||||||'.$SALT);
                           
const hashString = `${this.merchantKey}|${txnId}|${(dto.amount).toString()}|${productInfo}|${dto.fullName}|${dto.email}|||||||||||${this.merchantSalt}`;
console.log('HashString:-----  :', hashString);

//const hash = crypto.createHash('sha512').update(hashString);
const hash = crypto.createHash('sha512').update(hashString).digest('hex');
console.log('Generated Hash---------:', hash);

   return {
     gateway: 'PayUMoney',
     txnId,
     payuUrl: `${this.baseUrl}/_payment`,
     params: {
       key: this.merchantKey,
       txnid: txnId,
       amount: dto.amount,
       productinfo: productInfo,
       firstname: dto.fullName,
       email: dto.email,
       phone: dto.phone,
       surl: process.env.PAYU_SUCCESS_URL || "https://indiagalleri-frontend.vercel.app/api/client/payments/success",
       furl: process.env.PAYU_FAILURE_URL || "https://indiagalleri-frontend.vercel.app/api/client/payments/failure",
       hash,
     },
   };
 }
*/