import { Module } from '@nestjs/common';
import { ContactUsService } from './contactus.service';
import { ContactUsController } from './contactus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from 'src/shared/entities/contactus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactusModule {}
