import { Module } from '@nestjs/common';
import { InventProductService } from './invent-product.service';
import { InventProductController } from './invent-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';
import { Currency } from 'src/shared/entities/currency.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Inventory,Product,User,Currency])],
  controllers: [InventProductController],
  providers: [InventProductService],
})
export class InventProductModule {}
