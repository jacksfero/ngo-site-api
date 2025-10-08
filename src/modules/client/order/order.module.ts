import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from 'src/shared/entities/order.entity';
import { OrderItem } from 'src/shared/entities/order-item.entity';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { Shipping } from 'src/shared/entities/shipping.entity';
import { Payment } from 'src/shared/entities/payment.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Order,OrderItem,Product,User,Cart,CartItem,
    Inventory,UsersAddress,Shipping,Payment])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
