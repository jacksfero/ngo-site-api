import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
 
import { ClientTestimonialService } from './client-testimonial.service';
import { ClientTestimonialController } from './client-testimonial.controller';
 
import { Testimonial } from 'src/shared/entities/testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial])],
  providers: [ClientTestimonialService],
  controllers: [ClientTestimonialController],
})
export class ClientTestimonialModule {}
