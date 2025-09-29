import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { PayUMoneyService } from './gateways/payumoney.service';
import { RazorpayService } from './gateways/razorpay.service';
import { PaypalService } from './gateways/paypal.service';
import { Order } from '../entities/order.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Payment,Order])],
   controllers: [PaymentController],
  providers: [PaymentService, PayUMoneyService, RazorpayService, PaypalService],
  exports: [PaymentService],
})
export class PaymentModule {}
