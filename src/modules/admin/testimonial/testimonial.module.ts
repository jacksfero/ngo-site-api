import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { Testimonial } from 'src/shared/entities/testimonial.entity';
 

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial])],
  controllers: [TestimonialController],
  providers: [TestimonialService],
})
export class TestimonialModule {}
