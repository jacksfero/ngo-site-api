import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Post()
   @RequirePermissions('create_testimonail')
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialService.create(dto);
  }

  @Get()
   @RequirePermissions('read_testimonail')
  findAll() {
    return this.testimonialService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_testimonail')
  findOne(@Param('id') id: number) {
    return this.testimonialService.findOne(id);
  }

  @Patch(':id')
   @RequirePermissions('update_testimonail')
  update(@Param('id') id: number, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_testimonail')
  remove(@Param('id') id: number) {
    return this.testimonialService.remove(id);
  }

  @Post(':id/approve')
  @RequirePermissions('update_testimonail')
  approve(@Param('id') id: number) {
    return this.testimonialService.approve(id);
  }

  @Post(':id/reject')
  @RequirePermissions('update_testimonail')
  reject(@Param('id') id: number, @Body('reason') reason: string) {
    return this.testimonialService.reject(id, reason);
  }
}
