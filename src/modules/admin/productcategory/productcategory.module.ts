import { Module } from '@nestjs/common';
import { ProductcategoryService } from './productcategory.service';
import { ProductcategoryController } from './productcategory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Productcategory } from 'src/shared/entities/productcategory.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Productcategory])],
  controllers: [ProductcategoryController],
  providers: [ProductcategoryService],
})
export class ProductcategoryModule {}
