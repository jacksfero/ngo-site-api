import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from '../../../shared/entities/wishlist.entity';
import { Product } from '../../../shared/entities/product.entity';
import { User } from '../../../shared/entities/user.entity';
import { GlobalModule } from 'src/global/global.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Product, User]), GlobalModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
