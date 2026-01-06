import { Controller,Headers, Get, Res, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfigService } from '@nestjs/config';


@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService,
  private readonly config: ConfigService, 

  ) {}

  @Post('initiates')
  async initiates(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayments(dto);
  }

  @Post('callback/:gateway')
  async callbacks(@Param('gateway') gateway: string, @Body() body: any) {
    return this.paymentService.handleCallbacks(gateway, body);
  }

  @Post('failure')
 paymentFailure(@Body() response: any) {
   return { status: 'failed', data: response };
 }


 // ✅ PayUMoney success callback
  @Post('payumoney/success')
  async payuSuccess(@Body() body, @Res() res: Response) {
    const result = await this.paymentService.handleCallbacks('PayUMoney', body);

    // return res.redirect(
    //   `https://indiagalleri-frontend.vercel.app/payment-success?txnId=${result.txnId}&status=${result.status}`,
    // );
    return res.redirect(
  `${this.successRedirectUrl}?txnId=${result.txnId}&status=${result.status}`,
);
  }

  // ✅ PayUMoney failure callback
  @Post('payumoney/failure')
  async payuFailure(@Body() body, @Res() res: Response) {
    const result = await this.paymentService.handleCallbacks('PayUMoney', body);

    // return res.redirect(
    //   `https://indiagalleri-frontend.vercel.app/payment-failure?txnId=${result.txnId}&status=${result.status}`,
    // );
    return res.redirect(
  `${this.failureRedirectUrl}?txnId=${result.txnId}&status=${result.status}`,
);
  }
@Post('paypal/initiate')
  async initiatePaypal(@Body() dto: InitiatePaymentDto, @Res() res: Response) {
    const result = await this.paymentService.initiatePayments(dto);

    // Redirect user directly to PayPal
    return res.redirect(result.approveLink);
  }

   @Get('paypal/success')
  async paypalSuccess(@Query('token') token: string, @Res() res: Response) {
    const result = await this.paymentService.confirmPaypalPayment(token);

    // return res.redirect(
    //   `https://indiagalleri-frontend.vercel.app/payment-success?txnId=${result.txnId}&status=${result.status}`,
    // );

    return res.redirect(
  `${this.successRedirectUrl}?txnId=${result.txnId}&status=${result.status}`,
);

  }

  @Get('paypal/cancel')
async paypalCancel(@Query('token') token: string, @Res() res: Response) {
  const result = await this.paymentService.PaypalCancel(token);

  // return res.redirect(
  //   `https://indiagalleri-frontend.vercel.app/payment-failure?txnId=${token}&status=cancelled`,
  // );
      return res.redirect(
      `${this.failureRedirectUrl}?txnId=${token}&status=cancelled`,
    );
}
 

   @Post('webhook/razorpay')
async webhook(@Body() body: any, @Headers('x-razorpay-signature') signature: string) {
  return this.paymentService.handleWebhook(body, signature);
}
 
 
@Post('razorpay/callback')
async razorpayCallback(@Res() res: Response, @Body() body: any) {
  try {
    const verify = await this.paymentService.handleCallbackRazor(body);
	console.log(`success---------${this.config.get('FRONTEND_BASE_URL')}${this.config.get('FRONTEND_SUCCESS_PATH')}`)
    // ✅ Redirect to success page (frontend)
     console.error('Payment verification success:', verify);
  return res.redirect(
      `${this.successRedirectUrl}?txnId=${verify.txnId}&status=success`,
    );

  //  return res.redirect(`https://your-frontend.com/payment/success?txnId=${verify.txnId}`);
  } catch (error) {
    console.error('Payment verification failed:', error.message);
	console.log(`Failed---------${this.config.get('FRONTEND_BASE_URL')}${this.config.get('FRONTEND_FAILURE_PATH')}`)
    // ❌ Redirect to failure page
  //  return res.redirect(`https://your-frontend.com/payment/failure`);
     return res.redirect(
      `${this.failureRedirectUrl}?status=cancelled`,
    );
  }
}


private get successRedirectUrl() {
  return `${this.config.get('FRONTEND_BASE_URL')}${this.config.get('FRONTEND_SUCCESS_PATH')}`;
}

private get failureRedirectUrl() {
  return `${this.config.get('FRONTEND_BASE_URL')}${this.config.get('FRONTEND_FAILURE_PATH')}`;
}

}

/*
 // ✅ Step 1: Create payment request
 @Post('initiate')
 async initiate(
   @Body() body: { orderId: number; userId: number; amount: number; productName: string; email: string; phone: string },
 ) {
   return this.paymentService.initiatePayment(body.orderId, body.userId, body.amount, body.productName, body.email, body.phone);
 }

 @Post('callback')
 async callback(@Body() body: any) {
   return this.paymentService.handleCallback(body);
 }

 @Get('verify')
 async verify(@Query('txnid') txnid: string) {
   return this.paymentService.verifyTransaction(txnid);
 }

 // ✅ Step 2: Success callback
 @Post('success')
 paymentSuccess(@Body() response: any) {
   const verified = this.paymentService.verifyPayment(response);
   if (!verified) {
     return { status: 'failed', message: 'Hash verification failed' };
   }
   // update order status in DB
   return { status: 'success', data: response };
 }
*/
 // ✅ Step 3: Failure callback
 

 
 


/*

5. Frontend Flow

Call POST /payment/initiate with order details.

API returns { action, params }.

Submit a hidden HTML form with these values → redirects to PayUMoney checkout.

Example:

<form id="payuForm" method="POST" action="{{action}}">
  <input type="hidden" name="key" value="{{params.key}}" />
  <input type="hidden" name="txnid" value="{{params.txnid}}" />
  <input type="hidden" name="amount" value="{{params.amount}}" />
  <input type="hidden" name="productinfo" value="{{params.productinfo}}" />
  <input type="hidden" name="firstname" value="{{params.firstname}}" />
  <input type="hidden" name="email" value="{{params.email}}" />
  <input type="hidden" name="phone" value="{{params.phone}}" />
  <input type="hidden" name="surl" value="{{params.surl}}" />
  <input type="hidden" name="furl" value="{{params.furl}}" />
  <input type="hidden" name="hash" value="{{params.hash}}" />
</form>
<script>document.getElementById('payuForm').submit();</script>





Flow with PayUMoney

Initiate Payment

User clicks “Pay” → create an Order first.

Save a Payment record with status = "pending".

Generate the PayUMoney hash + redirect the user to PayUMoney checkout.

Payment Callback (Webhook/Return URL)

PayUMoney calls your API with transaction details.

Verify the hash to confirm authenticity.

Update Payment.status = "success" or "failed".

Update the linked Order status accordingly.

Future Enhancements

Store refund/cancellation if needed.

Support multiple gateways (Stripe, Razorpay, PayPal) with the same entity by storing paymentGateway.






6️⃣ Frontend Flow

Call POST /payments/initiate → get form action + params

Auto-submit an HTML form to PayUMoney with those params

User completes payment → PayUMoney calls /payments/callback

Update Order & Payment status
*/
