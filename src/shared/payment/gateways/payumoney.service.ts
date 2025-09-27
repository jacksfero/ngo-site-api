// gateways/payumoney.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from 'src/shared/entities/payment.entity';

@Injectable()
export class PayUMoneyService {
  private merchantKey = process.env.PAYU_KEY || 'Qu5Kb7';       // test/prod merchant key
  private merchantSalt = process.env.PAYU_SALT || 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsLjkNpxdiTri198kvVohJOrGRVB1DoAzgRBmUqQmRICUrUSuC53Hj950i79dx5mHZ9jKH7Oz' ;     // test/prod salt
  private baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in'; 

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

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
  
  // Initialize UDF parameters (empty strings)
  const udf1 = '';
  const udf2 = '';
  const udf3 = '';
  const udf4 = '';
  const udf5 = '';
  
  // Format amount to 2 decimal places
  const formattedAmount = dto.amount.toFixed(2);
  
  // Build hash string according to PayU formula
  // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const hashString = `${this.merchantKey}|${txnId}|${formattedAmount}|${productInfo}|${dto.fullName}|${dto.email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${this.merchantSalt}`;
  
  console.log('HashString:', hashString);
  
  // Generate SHA512 hash in hexadecimal format (not base64!)
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  
  console.log('Generated Hash (hex):', hash);
  
  // If PayU requires both v1 (SHA256) and v2 (SHA512) hashes (based on error message)
  // Uncomment the following if needed:
 
  const hashV1 = crypto.createHash('sha256').update(hashString).digest('hex');
  const hashV2 = crypto.createHash('sha512').update(hashString).digest('hex');
  
  const hashObject = {
    v1: hashV1,
    v2: hashV2
  };
  
  console.log('Hash Object:', hashObject);
  
  
  return {
    gateway: 'PayUMoney',
    txnId,
    payuUrl: `${this.baseUrl}/_payment`,
    params: {
      key: this.merchantKey,
      txnid: txnId,
      amount: formattedAmount, // Use formatted amount
      productinfo: productInfo,
      firstname: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      surl: process.env.PAYU_SUCCESS_URL || "https://indiagalleri-frontend.vercel.app/api/client/payments/success",
      furl: process.env.PAYU_FAILURE_URL || "https://indiagalleri-frontend.vercel.app/api/client/payments/failure",
      hash: hash, // Use the hex hash
      // Include UDF parameters in the request (even if empty)
      udf1: udf1,
      udf2: udf2,
      udf3: udf3,
      udf4: udf4,
      udf5: udf5,
    },
  };
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
 /** 🔹 Handle callback from PayUMoney */
async handleCallback(body: any) {
  const { key, txnid, amount, productinfo, firstname, email, status, hash } = body;

  const hashString = `${this.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  if (calculatedHash !== hash) {
    await this.updatePayment(txnid, PaymentStatus.FAILED, { reason: 'Hash mismatch' });
    return { success: false, message: 'Hash mismatch', txnId: txnid };
  }

  const newStatus = status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

  // ✅ Update DB
  await this.updatePayment(txnid, newStatus, body);

  return {
    success: newStatus === PaymentStatus.SUCCESS,
    txnId: txnid,
    amount,
    status: newStatus,
  };
}


  /** 🔹 Update Payment in DB */
  private async updatePayment(txnId: string, status: PaymentStatus, meta?: any) {
    await this.paymentRepo.update(
      { txnId: txnId },
      {
        status,
        meta: meta || {},
      },
    );
  }

  private generateTxnId(): string {
    return crypto.randomBytes(16).toString('hex').substring(0, 20);
  }
}
