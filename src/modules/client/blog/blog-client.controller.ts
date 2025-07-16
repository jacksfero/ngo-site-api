// modules/client/blog/blog-client.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { BlogClientService } from './blog-client.service';
 import { Public } from '../../../core/decorators/public.decorator';

@Controller('blogss')
export class BlogClientController {
  constructor(private readonly blogService: BlogClientService) {}

  @Get()
  @Public()
  findAll() {
    return this.blogService.findAllPublished();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.blogService.findOnePublished(+id);
  }
}