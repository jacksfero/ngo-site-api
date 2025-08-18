import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Product } from 'src/shared/entities/product.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Inventory,Product])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
