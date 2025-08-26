import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Product,ProductImage,Subject,Style])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
