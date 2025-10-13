// modules/client/blog/blog-client.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Blog } from '../../../shared/entities/blog.entity';
import { plainToInstance } from 'class-transformer';
 
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';
import { CategoryWithBlogCountDto } from './dto/category-with-count.dto';
import { Category } from '../../../shared/entities/category.entity';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
import { CacheService } from 'src/core/cache/cache.service';
import { response } from 'express';
import { BlogView } from 'src/shared/entities/blog-view.entity';


@Injectable()
export class BlogClientService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,

     @InjectRepository(BlogView)
    private blogViewRepo: Repository<BlogView>,

       @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

  ) {}

 /* async findAllPublished(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {*/
    async findAllPublished(
      paginationDto: PaginationBaseDto,
    ): Promise<PaginationResponseDto<BlogListDto>> {

      const { page , limit, search   } = paginationDto;
      const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';
   const cacheKey = `frontend:blog:${JSON.stringify(paginationDto)}`;
const cached = await this.cacheService.get(cacheKey);
if (cached) {
  return cached as PaginationResponseDto<BlogListDto>;
}

       const queryBuilder = this.blogRepo
       .createQueryBuilder('blog')    
       .select(['blog.id','blog.title','blog.views', 'blog.descriptionTag','blog.scheduledPublishDate', 'blog.slug','blog.createdAt','blog.titleImage','blog.blogContent'])
       .leftJoin('blog.category', 'category', 'category.status = :isActive', { isActive: true })
       .addSelect([ 'category.name', 'category.slug'])
       .leftJoin('blog.tags', 'tags')
       .leftJoin('blog.author', 'author')
        .addSelect([  'author.username'])
       .where('blog.status = :status', { status: true })
       .orderBy('blog.createdAt', 'DESC')
       .take(limit)
       .skip(skip);

       if (searchTerm) {
        queryBuilder.andWhere(
          `(LOWER(blog.title) LIKE :search 
        OR LOWER(category.name) LIKE :search
        OR LOWER(tags.name) LIKE :search
        OR LOWER(author.username) LIKE :search)`,
          { search: `%${searchTerm.toLowerCase()}%` },
        );
      }
      const [result, total] = await queryBuilder.getManyAndCount();
        // Check if results exist
     if (result.length === 0 && total === 0) {
      throw new NotFoundException('No Blog found matching your criteria');
    }
    // Check if requested page exists
   const totalPages = Math.ceil(total / limit);
   if (page > totalPages && totalPages > 0) {
     throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
   }
   const data = plainToInstance(BlogListDto, result, {
    excludeExtraneousValues: true,
  });

 const response = new PaginationResponseDto(data, { total, page, limit  });
        await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 900 });

  return response;
  }

   async findAll_top_viewed(
      paginationDto: PaginationBaseDto,
    ): Promise<PaginationResponseDto<BlogListDto>> {

      const { page , limit, search   } = paginationDto;
      const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';
   const cacheKey = `frontend:blog:topViews:${JSON.stringify(paginationDto)}`;
const cached = await this.cacheService.get(cacheKey);
if (cached) {
  return cached as PaginationResponseDto<BlogListDto>;
}

       const queryBuilder = this.blogRepo
       .createQueryBuilder('blog')    
       .select(['blog.id','blog.title','blog.views','blog.descriptionTag','blog.scheduledPublishDate', 'blog.slug','blog.createdAt','blog.titleImage','blog.blogContent'])
       .leftJoin('blog.category', 'category', 'category.status = :isActive', { isActive: true })
       .addSelect([ 'category.name', 'category.slug'])
       .leftJoin('blog.tags', 'tags')
       .leftJoin('blog.author', 'author')
        .addSelect([  'author.username'])
       .where('blog.status = :status', { status: true })
       .orderBy('blog.views', 'DESC')
       .take(limit)
       .skip(skip);

       if (searchTerm) {
        queryBuilder.andWhere(
          `(LOWER(blog.title) LIKE :search 
        OR LOWER(category.name) LIKE :search
        OR LOWER(tags.name) LIKE :search
        OR LOWER(author.username) LIKE :search)`,
          { search: `%${searchTerm.toLowerCase()}%` },
        );
      }
      const [result, total] = await queryBuilder.getManyAndCount();
        // Check if results exist
     if (result.length === 0 && total === 0) {
      throw new NotFoundException('No Blog found matching your criteria');
    }
    // Check if requested page exists
   const totalPages = Math.ceil(total / limit);
   if (page > totalPages && totalPages > 0) {
     throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
   }
   const data = plainToInstance(BlogListDto, result, {
    excludeExtraneousValues: true,
  });

 const response = new PaginationResponseDto(data, { total, page, limit  });
        await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)) );

  return response;
  }

 
   async getBlogBySlug(slug: string, viewerIdentifier: string): Promise<BlogListDto> {
    const cacheKey = `frontend:blog:${slug}`;
    let blog = await this.cacheService.get<Blog>(cacheKey);

    // ✅ Fix: remove re-declaration of "blog"
    if (!blog) {
      blog = await this.blogRepo.findOne({
        where: { slug, status: true },
        relations: ['category', 'tags'],
      });

      if (!blog) throw new NotFoundException('Blog not found');

     
    }

    // ✅ Now blog is always defined, but add safeguard
    if (!blog) throw new NotFoundException('Blog not found');

    const blogId = blog.id; // ✅ define for later use

    // ✅ Unique view logic
    const existingView = await this.blogViewRepo.findOne({
      where: { blog: { id: blogId }, viewerIdentifier },
    });

    if (!existingView) {
      await this.blogViewRepo.save({
        blog: { id: blogId },
        viewerIdentifier,
      });

      // ✅ Increment in DB
      await this.blogRepo.increment({ id: blogId }, 'views', 1);

      // ✅ Increment in cache
      if (typeof blog.views === 'number') {
        blog.views += 1;
        await this.cacheService.set(cacheKey, blog);
      }
    }

    // ✅ Return DTO
    const response = plainToInstance(BlogListDto, blog, {
      excludeExtraneousValues: true,
    });
     await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
     return response;
  }
 

  /*async findBlogsByCategory(categoryId: number, page = 1, limit = 10): Promise<PaginationResponseDto<BlogListDto>> {
  const [result, total] = await this.blogRepo.findAndCount({
    where: {
      isPublished: true,
      category: { id: categoryId },
    },
    relations: ['category', 'tags'], // include related entities if needed
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  }*/

async findBlogsByCategorySlug(
  slug: string,
  paginationDto: PaginationDto,
): Promise<PaginationResponseDto<BlogListDto>> {

    const { page = 1, limit = 10, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';
   const cacheKey = 'frontend:blogcat:active';
  
       // ✅ 1. Try cache first
     const cached = await this.cacheService.get(cacheKey);
    if (cached  ) {
      return cached as PaginationResponseDto<BlogListDto>;
    } // ✅ 2. Fetch from DB if not cached
 const where: any = {
  status: true,
    category: { slug },
  };
   // Optional title/h1Title search (simple LIKE)
  if (searchTerm) {
    where.title = () => `LOWER(blog.title) LIKE '%${searchTerm}%'`;
    // You could use a custom QueryBuilder if needed here for performance
  }
  const [result, total] = await this.blogRepo.findAndCount({
    where: where,
  
     take: limit,
    skip,
    order: { createdAt: 'DESC' },
  });
 
 
const data = plainToInstance(BlogListDto, result, {
  excludeExtraneousValues: true,
  enableImplicitConversion: true, // optional but helps with nested types
});
  const response = new PaginationResponseDto(data, {
    total,
    page,
    limit,
  });

   await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  // console.log('✅ Cache miss:', cacheKey);
  return response;
} 
 
async findBlogsByTagSlug(
  slug: string,
  paginationDto: PaginationDto,
): Promise<PaginationResponseDto<BlogListDto>> {
  const { page = 1, limit = 10, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';
const cacheKey = 'frontend:blogtag:active';
  
       // ✅ 1. Try cache first
     const cached = await this.cacheService.get(cacheKey);
    if (cached  ) {
      return cached as PaginationResponseDto<BlogListDto>;
    }
   // Validate input parameters
   if (page < 1) throw new BadRequestException('Page must be greater than 0');
   if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

  const query = this.blogRepo
    .createQueryBuilder('blog')
    .leftJoinAndSelect('blog.category', 'category')
    .leftJoinAndSelect('blog.tags', 'tag')
    .leftJoinAndSelect('blog.author', 'author')
    .where('blog.status = :published', { published: true })
    .andWhere('tag.slug = :slug', { slug });

  if (searchTerm) {
    query.andWhere(
      '(LOWER(blog.title) LIKE :search )',
    //  '(LOWER(blog.title) LIKE :search OR LOWER(blog.h1Title) LIKE :search)',
      { search: `%${searchTerm}%` },
    );
  }

  query.orderBy('blog.createdAt', 'DESC').skip(skip).take(limit);

  const [result, total] = await query.getManyAndCount();

  // Check if results exist
  if (result.length === 0 && total === 0) {
    throw new NotFoundException('No Blog found matching your criteria');
  }

   // Check if requested page exists
   const totalPages = Math.ceil(total / limit);
   if (page > totalPages && totalPages > 0) {
     throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
   }
   
  const data = plainToInstance(BlogListDto, result, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });

 const response = new PaginationResponseDto(data, {
    total,
    page,
    limit,
  });

   await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  // console.log('✅ Cache miss:', cacheKey);
  return response;
}

 

async getCategoriesWithBlogCount(): Promise<CategoryWithBlogCountDto[]> {
   const cacheKey = 'frontend:blogcount:active';
  
       // ✅ 1. Try cache first
     const cached = await this.cacheService.get<CategoryWithBlogCountDto[]>(cacheKey);
    if (cached && cached.length) {
      return cached;
    } // ✅ 2. Fetch from DB if not cached
  const raw = await this.categoryRepo
    .createQueryBuilder('category')
    .leftJoin('category.blogs', 'blog', 'blog.status = true')
    .select(['category.id', 'category.name', 'category.slug'])
    .addSelect('COUNT(blog.id)', 'blogCount')
    .groupBy('category.id')
    .having('COUNT(blog.id) > 0')
    .getRawMany();

  const response = plainToInstance(CategoryWithBlogCountDto, raw.map((c) => ({
    id: c.category_id,
    name: c.category_name,
    slug: c.category_slug,
    blogCount: Number(c.blogCount),
  })), {
    excludeExtraneousValues: true,
  });

     await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  // console.log('✅ Cache miss:', cacheKey);
  return response;
}


}
