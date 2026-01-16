import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { PayUMoneyService } from './gateways/payumoney.service';
import { RazorpayService } from './gateways/razorpay.service';
import { PaypalService } from './gateways/paypal.service';
import { Order } from '../entities/order.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersService } from 'src/modules/admin/users/users.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/admin/users/users.module';
import { Cart } from '../entities/cart.entity';
import { Inventory } from '../entities/inventory.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Payment,Order,Cart,Inventory]),
   // UsersModule,        // 👈 MUST BE HERE
    AuthModule,         // if required
  ],
   controllers: [PaymentController],
  providers: [PaymentService, PayUMoneyService, RazorpayService,
    
    PaypalService, ],
  exports: [PaymentService],
})
export class PaymentModule {}
