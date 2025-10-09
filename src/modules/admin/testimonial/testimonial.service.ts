import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { Testimonial } from 'src/shared/entities/testimonial.entity';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class TestimonialService {
  constructor(

     private readonly cacheService: CacheService,

    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateTestimonialDto) {
     const testimonial = this.testimonialRepo.create({
    ...dto,
    status: 'pending',
  });

  const testi = await this.testimonialRepo.save(testimonial);

  await this.cacheService.deletePattern('frontend:testimonials:*');

  return testi;
  }

  async findAll() {
    return this.testimonialRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async update(id: number, dto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id);
    Object.assign(testimonial, dto);
    const testimonials = await this.testimonialRepo.save(testimonial);

    await this.cacheService.deletePattern('frontend:testimonials:*');

    return testimonials;
  }

  async remove(id: number) {
    const testimonial = await this.findOne(id);
    return this.testimonialRepo.remove(testimonial);
  }

  async approve(id: number) {
    const testimonial = await this.findOne(id);
    testimonial.status = 'approved';
    await this.testimonialRepo.save(testimonial);
     await this.cacheService.deletePattern('frontend:testimonials:*');
    await this.mailService.sendTemplateEmail({
      to: testimonial.email,
      subject: 'Your testimonial has been approved 🎉',
      template: 'testimonial-approved',
      context: {
        name: testimonial.name,
        message: testimonial.message,
      },
    });

    return { message: 'Testimonial approved and email sent.' };
  }

  async reject(id: number, reason: string) {
    const testimonial = await this.findOne(id);
    testimonial.status = 'rejected';
    testimonial.rejectionReason = reason;
    await this.testimonialRepo.save(testimonial);
     await this.cacheService.deletePattern('frontend:testimonials:*');
    await this.mailService.sendTemplateEmail({
      to: testimonial.email,
      subject: 'Your testimonial was not approved',
      template: 'testimonial-rejected',
      context: {
        name: testimonial.name,
        reason,
      },
    });

    return { message: 'Testimonial rejected and email sent.' };
  }
}
