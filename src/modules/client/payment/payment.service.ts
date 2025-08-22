import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {

  private readonly key = process.env.PAYU_KEY;
  private readonly salt = process.env.PAYU_SALT;
  private readonly baseUrl = process.env.PAYU_BASE_URL;


 
  
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
   
  



  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
