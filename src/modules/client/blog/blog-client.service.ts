// modules/client/blog/blog-client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Blog } from '../../../shared/entities/blog.entity';
import { plainToInstance } from 'class-transformer';
import { PaginationWithSortDto } from 'src/shared/dto/pagination-with-sort.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';

@Injectable()
export class BlogClientService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async findAllPublished(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {

    const { page = 1, limit = 2, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';

const whereClause = searchTerm
    ? [
        { blogContent: Like(`%${searchTerm}%`) },
       // { email: Like(`%${searchTerm}%`) },
       // { subject: Like(`%${searchTerm}%`) },
      ]
    : {};

  const [result, total] = await this.blogRepo.findAndCount({
    where: whereClause,
    take: limit,
    skip,
    order: { createdAt: 'DESC' },
  });


   const data = plainToInstance(BlogListDto, result); // returns CreateContactUsDto[]
   
     return new PaginationResponseDto<BlogListDto>(data, {
       total,
       page,
       limit,
     });
  }
 
  async getBlogBySlug(slug: string):Promise<BlogListDto> {
    const blog = await this.blogRepo.findOne({
      where: {
        slug,
        isPublished: false,
      },
       //relations: ['category', 'tags'], // ✅ include if your DTO exposes these
    });
    if (!blog) throw new NotFoundException("Blog Not Found");
   return plainToInstance(BlogListDto, blog, {
    excludeExtraneousValues: true, // ✅ ensures only @Expose fields are returned
  });
  }








}
