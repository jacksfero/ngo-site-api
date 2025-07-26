// modules/client/blog/blog-client.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogClientService } from './blog-client.service';
 import { Public } from '../../../core/decorators/public.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';

@Controller()
export class BlogClientController {
  constructor(private readonly blogService: BlogClientService) {}

 
 @Get()
 @Public()
  findAll(
    @Query() paginationDto: PaginationDto,
  )  {
    return this.blogService.findAllPublished(paginationDto);
  }


  
 @Get(':slug')
  @Public()
  getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }



}