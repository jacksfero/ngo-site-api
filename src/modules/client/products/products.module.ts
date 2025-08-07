import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/shared/entities/product.entity';
import { Style } from 'src/shared/entities/style.entity';
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Subject } from 'src/shared/entities/subject.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Product,Style,Surface,Medium,Subject])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
