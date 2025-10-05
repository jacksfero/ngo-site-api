import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/shared/entities/order.entity';
import { OrderItem } from 'src/shared/entities/order-item.entity';
import { Payment } from 'src/shared/entities/payment.entity';
import { User } from 'src/shared/entities/user.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Order,OrderItem,Payment,User,UsersAddress])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
