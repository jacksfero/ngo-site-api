import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentRequestDto } from './dto/payment-request.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}



 // ✅ Step 1: Create payment request
 @Post('initiate')
 initiatePayment(@Body() paymentDto: PaymentRequestDto) {
   return this.paymentService.generatePaymentUrl(paymentDto);
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

 // ✅ Step 3: Failure callback
 @Post('failure')
 paymentFailure(@Body() response: any) {
   return { status: 'failed', data: response };
 }





  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}


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
*/