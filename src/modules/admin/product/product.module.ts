import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { PackingModeEntity } from 'src/shared/entities/packing-mode.entity';
import { CommissionType } from 'src/shared/entities/commission-type.entity';
import { ShippingTime } from 'src/shared/entities/shipping-time.entity';
import { Size } from 'src/shared/entities/size.entity';
import { Orientation } from 'src/shared/entities/orientation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Subject, Style, Productcategory, PackingModeEntity,
    CommissionType, ShippingTime, Size, Orientation

  ])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule { }
