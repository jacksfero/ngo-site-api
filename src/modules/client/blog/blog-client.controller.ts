// modules/client/blog/blog-client.controller.ts
import { Controller, Post,Get, Param, Query, Req } from '@nestjs/common';
import { BlogClientService } from './blog-client.service';
 import { Request } from 'express';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';
import { CategoryWithBlogCountDto } from './dto/category-with-count.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { FRONT_BLOG_LIMIT, FRONT_BLOG_MAX_LIMIT,FRONT_BLOG_PAGE} from 'src/shared/config/pagination.config';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';

@Controller()
export class BlogClientController {
  constructor(private readonly blogService: BlogClientService) {}

 /*
 @Get() 
  findAll(
    @Query() paginationDto: PaginationDto,
  )  {
    return this.blogService.findAllPublished(paginationDto);
  }*/
  @Get()
  async findAll(
    @Query(new PaginationPipe(FRONT_BLOG_LIMIT, FRONT_BLOG_MAX_LIMIT, FRONT_BLOG_PAGE))
    paginationDto: PaginationBaseDto
  ): Promise<PaginationResponseDto<BlogListDto>> {
    return this.blogService.findAllPublished(paginationDto);
  }

    // ✅ Like Blog
  @Post(':id/like')
  async likeBlog(@Param('id') blogId: number, @Req() req: Request) {
    const viewerIdentifier =
      (req as any).user?.id ||
      req.cookies?.viewerId ||
      req.ip;

    return this.blogService.likeBlog(blogId, String(viewerIdentifier));
  }
  
 @Get('top-viewed')
  async findAll_top_viewed(
    @Query(new PaginationPipe(FRONT_BLOG_LIMIT, FRONT_BLOG_MAX_LIMIT, FRONT_BLOG_PAGE))
    paginationDto: PaginationBaseDto
  ): Promise<PaginationResponseDto<BlogListDto>> {
    return this.blogService.findAll_top_viewed(paginationDto);
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
  
@Post(':slug/view')
  async incrementView(
    @Param('slug') slug: string, 
   @Req() req: Request
  ) {
     const viewerIdentifier =
      (req as any)?.user?.id?.toString() || (req as any)?.ip || 'unknown';
    await this.blogService.incrementView(slug, viewerIdentifier);
    return { 
      success: true, 
      message: 'View count processed' 
    };
  }
 

  @Get(':slug')
  async getBlog(@Param('slug') slug: string, @Req() req: Request) {
    // ✅ Fix: use "as any" for extended properties (req.user, req.ip)
    const viewerIdentifier =
      (req as any)?.user?.id?.toString() || (req as any)?.ip || 'unknown';

    return this.blogService.getBlogBySlug(slug, viewerIdentifier);
  }




}