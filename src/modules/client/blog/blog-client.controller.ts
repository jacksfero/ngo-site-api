// modules/client/blog/blog-client.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogClientService } from './blog-client.service';
 
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';
import { CategoryWithBlogCountDto } from './dto/category-with-count.dto';

@Controller()
export class BlogClientController {
  constructor(private readonly blogService: BlogClientService) {}

 
 @Get()
 
  findAll(
    @Query() paginationDto: PaginationDto,
  )  {
    return this.blogService.findAllPublished(paginationDto);
  }

@Get('categories-with-count')
 
  async getCategoriesWithBlogCount(): Promise<CategoryWithBlogCountDto[]> {
    return this.blogService.getCategoriesWithBlogCount();
  }
  


 @Get('category/:slug')
  
  async getBlogsByCategory(
    @Param('slug') slug: string,
     @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {
    return this.blogService.findBlogsByCategorySlug(slug, paginationDto);
  }

   @Get('tags/:slug')
   
  async getBlogsByTag(
    @Param('slug') slug: string,
     @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {
    return this.blogService.findBlogsByTagSlug(slug, paginationDto);
  }

 @Get(':slug')
 
  getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }
}