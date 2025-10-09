import { Controller, Get, Param } from '@nestjs/common';
import { ClientTestimonialService } from './client-testimonial.service';

@Controller()
export class ClientTestimonialController {
  constructor(private readonly testimonialService: ClientTestimonialService) {}

  // ✅ GET /client/testimonials
  @Get()
  async getAll() {
    return await this.testimonialService.findAll();
  }

  // ✅ GET /client/testimonials/:id
  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.testimonialService.findById(id);
  }
}
