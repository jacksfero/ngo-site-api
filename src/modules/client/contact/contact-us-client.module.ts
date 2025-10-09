import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { ContactUsClientService } from './contact-us-client.service';
import { ContactUsClientController } from './contact-us-client.controller';
 
@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsClientController],
  providers: [ContactUsClientService, ],
})
export class ContactUsClientModule {}
