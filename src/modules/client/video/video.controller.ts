import { Controller, Get, Param } from '@nestjs/common';
import { ClientVideoService } from './video.service';

@Controller()
export class ClientVideoController {
  constructor(private readonly videoService: ClientVideoService) {}

  // ✅ GET /client/testimonials
  @Get(':id')
  async getAll(@Param('id') id: number) {

   
    return await this.videoService.findAll(id);
  }

  // ✅ GET /client/testimonials/:id
//   @Get(':id')
//   async getById(@Param('id') id: number) {
//     return await this.videoService.findById(id);
//   }
}
