import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MisService } from './mis.service';
import { MisController } from './mis.controller';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { Order } from 'src/shared/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, ContactUs, Order])],
  controllers: [MisController],
  providers: [MisService],
})
export class MisModule {}
