import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Product,ProductImage])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
