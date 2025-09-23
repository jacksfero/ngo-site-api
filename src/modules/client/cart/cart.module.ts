import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { User } from 'src/shared/entities/user.entity';
import { Product } from 'src/shared/entities/product.entity';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Currency } from 'src/shared/entities/currency.entity';
import { CacheService } from 'src/core/cache/cache.service';
import { UnifiedCacheModule } from 'src/core/cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart,CartItem,User,Product,Inventory,Currency])
  ,UnifiedCacheModule,
],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})

export class CartModule {}
 