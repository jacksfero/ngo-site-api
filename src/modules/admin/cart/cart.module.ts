// cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartAdminController } from './cart.controller';
import { User } from 'src/shared/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem,User])],
  providers: [CartService],
  controllers: [CartAdminController],
  exports: [CartService],
})
export class CartAdminModule {}

