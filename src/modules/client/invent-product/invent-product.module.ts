import { Module } from '@nestjs/common';
import { InventProductService } from './invent-product.service';
import { InventProductController } from './invent-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Inventory,Product,User])],
  controllers: [InventProductController],
  providers: [InventProductService],
})
export class InventProductModule {}
