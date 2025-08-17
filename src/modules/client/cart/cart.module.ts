import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { User } from 'src/shared/entities/user.entity';
import { Product } from 'src/shared/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart,CartItem,User,Product])],
  controllers: [CartController],
  providers: [CartService],
})

export class CartModule {}
