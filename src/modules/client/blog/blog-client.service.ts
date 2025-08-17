// modules/client/blog/blog-client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Blog } from '../../../shared/entities/blog.entity';
import { plainToInstance } from 'class-transformer';
 
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';
import { CategoryWithBlogCountDto } from './dto/category-with-count.dto';
import { Category } from '../../../shared/entities/category.entity';


@Injectable()
export class BlogClientService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,

       @InjectRepository(Category)
    private categoryRepo: Repository<Category>,


  ) {}

  async findAllPublished(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {

    const { page = 1, limit = 10, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';

 const where: any = {
    status: true,
   // category: { slug },
  };

  const [result, total] = await this.blogRepo.findAndCount({
    where: where,
    take: limit,
    skip,
    order: { createdAt: 'DESC' },
  });


   const data = plainToInstance(BlogListDto, result,{ excludeExtraneousValues: true }); // returns CreateContactUsDto[]
   
       return new PaginationResponseDto(data, { total, page, limit });
  }
 
  async getBlogBySlug(slug: string): Promise<BlogListDto> {
  const blog = await this.blogRepo.findOne({
    where: {
      slug,
      status: true, // ✅ likely should be true, not false
    },
    relations: ['category', 'tags'], // ✅ include if your DTO exposes these
  });

  if (!blog) throw new NotFoundException('Blog not found');

  return plainToInstance(BlogListDto, blog, {
    excludeExtraneousValues: true, // ✅ ensures only @Expose fields are returned
  });
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
  return new PaginationResponseDto(data, {
    total,
    page,
    limit,
  });
} 
 
async findBlogsByTagSlug(
  slug: string,
  paginationDto: PaginationDto,
): Promise<PaginationResponseDto<BlogListDto>> {
  const { page = 1, limit = 10, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';

  const query = this.blogRepo
    .createQueryBuilder('blog')
    .leftJoinAndSelect('blog.category', 'category')
    .leftJoinAndSelect('blog.tags', 'tag')
    .leftJoinAndSelect('blog.author', 'author')
    .where('blog.status = :published', { published: true })
    .andWhere('tag.slug = :slug', { slug });

  if (searchTerm) {
    query.andWhere(
      '(LOWER(blog.title) LIKE :search OR LOWER(blog.h1Title) LIKE :search)',
      { search: `%${searchTerm}%` },
    );
  }

  query.orderBy('blog.createdAt', 'DESC').skip(skip).take(limit);

  const [result, total] = await query.getManyAndCount();

  const data = plainToInstance(BlogListDto, result, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });

  return new PaginationResponseDto(data, {
    total,
    page,
    limit,
  });
}

 

async getCategoriesWithBlogCount(): Promise<CategoryWithBlogCountDto[]> {
  const raw = await this.categoryRepo
    .createQueryBuilder('category')
    .leftJoin('category.blogs', 'blog', 'blog.status = true')
    .select(['category.id', 'category.name', 'category.slug'])
    .addSelect('COUNT(blog.id)', 'blogCount')
    .groupBy('category.id')
    .having('COUNT(blog.id) > 0')
    .getRawMany();

  return plainToInstance(CategoryWithBlogCountDto, raw.map((c) => ({
    id: c.category_id,
    name: c.category_name,
    slug: c.category_slug,
    blogCount: Number(c.blogCount),
  })), {
    excludeExtraneousValues: true,
  });
}


}
