import { Module } from '@nestjs/common';
import { ShippingTimeService } from './shipping-time.service';
import { ShippingTimeController } from './shipping-time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
 
import { ShippingTime } from '../entities/shipping-time.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ShippingTime])],
  controllers: [ShippingTimeController],
  providers: [ShippingTimeService],
  exports:[ShippingTimeService]
})
export class ShippingTimeModule {}
