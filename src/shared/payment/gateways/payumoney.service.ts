// gateways/payumoney.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from 'src/shared/entities/payment.entity';

@Injectable()
export class PayUMoneyService {
  private merchantKey = process.env.PAYU_KEY;       // test/prod merchant key
  private merchantSalt = process.env.PAYU_SALT;     // test/prod salt
  private baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in'; 

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  
  /** 🔹 Initiate payment */
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

    const hashString = `${this.merchantKey}|${txnId}|${dto.amount}|${productInfo}|${dto.fullName}|${dto.email}|||||||||||${this.merchantSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

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
        surl: process.env.PAYU_SUCCESS_URL,
        furl: process.env.PAYU_FAILURE_URL,
        hash,
      },
    };
  }
  /** 🔹 Handle callback from PayUMoney */
   /** 🔹 Handle callback from PayUMoney */
   async handleCallback(body: any) {
    const { key, txnid, amount, productinfo, firstname, email, status, hash } = body;

    const hashString = `${this.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== hash) {
      return { success: false, message: 'Hash mismatch', txnId: txnid };
    }

    const newStatus = status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

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
