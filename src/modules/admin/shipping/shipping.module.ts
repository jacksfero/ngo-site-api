import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Shipping } from '../../../shared/entities/shipping.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Shipping])],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class ShippingModule {}
