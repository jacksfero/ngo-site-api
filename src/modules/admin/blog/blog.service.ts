import { Injectable,ConflictException, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/shared/entities/blog.entity';
import { Category } from 'src/shared/entities/category.entity';
import { Tag } from 'src/shared/entities/tag.entity';
import { User } from 'src/shared/entities/user.entity';
import { slugify } from 'src/shared/utils/slugify';
import * as fs from 'fs';
import * as path from 'path';
import { BlogPaginationDto } from './dto/blog-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogListDto } from './dto/blog-list.dto';
import { plainToInstance } from 'class-transformer';
import { S3Service } from 'src/shared/s3/s3.service';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
import { CacheService } from 'src/core/cache/cache.service';


@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);
  constructor(
    private cacheService: CacheService,

    private readonly s3service: S3Service,

    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) { }

  async create(dto: CreateBlogDto, user: any, imageFilename?:Express.Multer.File | null): Promise<Blog> {
   // let titleImage;
    let titleImage: string | null = null;
    // Validate input
    if (!dto.title || !dto.categoryId) {
        throw new BadRequestException('Title and category are required');
    }

    // Check for existing blog
    const [existingByTitle, existingBySlug] = await Promise.all([
        this.blogRepository.findOneBy({ title: dto.title }),
        dto.slug ? this.blogRepository.findOneBy({ slug: dto.slug }) : null
    ]);

    if (existingByTitle) throw new ConflictException('Blog title already exists');
    if (existingBySlug) throw new ConflictException('Blog slug already exists');

    // Fetch related entities
    const [category, tags, author] = await Promise.all([
        this.categoryRepository.findOneBy({ id: dto.categoryId }),
        dto.tagIds?.length ? this.tagRepository.findBy({ id: In(dto.tagIds) }) : [],
        this.userRepository.findOneBy({ id: dto.author })
    ]);

    if (!category) throw new NotFoundException(`Category not found`);
    if (!author) throw new NotFoundException('Author not found');
    if(imageFilename){
      const cleanName = sanitizeFileName(imageFilename.originalname);
      const key = `blog/${Date.now()}-${cleanName}`;
     // console.log('file----',cleanName,'---path------',key);
      titleImage = 
    await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype); 
    }
    // Create blog entity with proper null handling
    const blog = new Blog();
    blog.title = dto.title;
    blog.slug = await this.generateUniqueSlug(dto.slug);
    blog.h1Title = dto.h1Title || dto.title;
    blog.blogContent = dto.blogContent;
    blog.descriptionTag = dto.descriptionTag || ''; // Handle undefined
    blog.optionalTitle = dto.optionalTitle || '';   // Handle undefined
  //  blog.titleImage = imageFilename ? `/blog-images/${imageFilename}` : null;
    blog.titleImage = titleImage;
    blog.status = dto.status ?? false;
    blog.isPublished = dto.isPublished ?? false;
    blog.scheduledPublishDate = dto.scheduledPublishDate || null;
    blog.category = category;
    blog.tags = tags;
    blog.author = author;
   // blog.createdBy = user.username || user.email || user.sub.toString();
  //  blog.updatedBy = user.username || user.email || user.sub.toString();

    const response = this.blogRepository.save(blog);
     await this.cacheService.deletePattern('Admin:blog:*');
     return response;
}

private async deleteImageFile(filename: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', 'blog-images', filename);
    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }
}

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (await this.blogRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  async findAll(
    paginationDto: BlogPaginationDto,
  ): Promise<PaginationResponseDto<BlogListDto>> {
   /* return this.blogRepository.find({
       relations: ['category', 'tags', 'author'],
      order: { createdAt: 'DESC' },
    });*/
    const { page , limit, search,status   } = paginationDto;
    const skip = (page - 1) * limit;
    //const search = search || '';
   const cacheKey = `Admin:blog:${JSON.stringify(paginationDto)}`;
  const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached as PaginationResponseDto<BlogListDto>;
      }
    const queryBuilder = this.blogRepository
    .createQueryBuilder('blog')    
    .leftJoinAndSelect('blog.category', 'category')
    .leftJoinAndSelect('blog.tags', 'tags')
    .leftJoinAndSelect('blog.author', 'author')
    .orderBy('blog.id', 'DESC')
    .take(limit)
    .skip(skip);
  
    if (search) {
      queryBuilder.andWhere(
        `(LOWER(blog.title) LIKE :search 
      OR LOWER(category.name) LIKE :search
      OR LOWER(author.username) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (typeof status === 'boolean') {
      queryBuilder.andWhere('blog.status = :status', { status });
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
  
  //  return new PaginationResponseDto(data, { total, page, limit  });
    const response = new PaginationResponseDto(data, { total, page, limit });
    await this.cacheService.set(cacheKey, response);
    return response;
  }

  async publish(id: number) {
    await this.blogRepository.update(id, {
      isPublished: true,
      scheduledPublishDate: null,
    });
  }

  // modules/blog/blog.service.ts
  async unschedulePublish(id: number) {
    await this.blogRepository.update(id, {
      scheduledPublishDate: null, // Now works correctly
    });
  }

  // Service
  async resetPublishSchedule(id: number) {
    return this.blogRepository.update(id, {
      scheduledPublishDate: null // Works perfectly now
    });
  }
  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'author'],
    });
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async update(id: number, dto: UpdateBlogDto,imageFilename?: Express.Multer.File|null): Promise<Blog> {
    let titleImage: string | null = null;
    const blog = await this.findOne(id);
     if (!blog) throw new NotFoundException('blog not found');
     if (dto.slug && dto.slug !== blog.slug) {
    blog.slug = await this.generateUniqueSlug(dto.slug);   
  }
   blog.title = dto.title?? blog.title;
    blog.h1Title = dto.h1Title ?? blog.h1Title;
  blog.blogContent = dto.blogContent ?? blog.blogContent;
 // if(dto.author){
// ✅ Handle author relation (only if provided)
if (dto.author) {
  blog.author = { id: dto.author } as User;
}
 // }
   // blog.author = dto.author;
   

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    if (dto.tagIds?.length) {
      blog.tags = await this.tagRepository.findBy({ id: In(dto.tagIds) });
    }
     // 1. Handle Image Update if New File is Provided
  
  if (imageFilename) {
    const cleanName = sanitizeFileName(imageFilename.originalname);
    const key = `blog/${Date.now()}-${cleanName}`;  
    // Upload new image
    const titleImage = await this.s3service.uploadBuffer(
      key,
      imageFilename.buffer,
      imageFilename.mimetype
    );
    // Delete old image if exists
  if (blog.titleImage) {
   // const oldKey = this.extractS3Key(blog.titleImage);
    await this.s3service.deleteObject(blog.titleImage);
  }      
    // Save new image path/URL
  blog.titleImage = titleImage;       
     
  }
  blog.keywordsTag = dto.keywordsTag??'';    
  blog.scheduledPublishDate = dto.scheduledPublishDate??null;  
  blog.descriptionTag = dto.descriptionTag??'';      
    //return this.blogRepository.save(blog);
     const response = this.blogRepository.save(blog);
     await this.cacheService.deletePattern('Admin:blog:*');
     return response;
  }

  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Blog post not found');
    }
  }

  async validateBlogTitleAndSlug(
    title: string, 
    slug: string, 
    excludeId?: number
  ): Promise<{ isTitleUnique: boolean, isSlugUnique: boolean }> {
    // Create properly typed where conditions
    const whereConditions: FindOptionsWhere<Blog>[] = [];
    
    if (title) {
      whereConditions.push({ 
        title,
        ...(excludeId && { id: Not(excludeId) })
      });
    }
    
    if (slug) {
      whereConditions.push({ 
        slug,
        ...(excludeId && { id: Not(excludeId) })
      });
    }
  
    const existing = await this.blogRepository.find({ 
      where: whereConditions 
    });
  
    return {
      isTitleUnique: !existing.some(blog => blog.title === title),
      isSlugUnique: !existing.some(blog => blog.slug === slug),
    };
  }


    // content.service.ts
    async toggleStatus(id: number, user: any): Promise<Blog> {
      const blog = await this.blogRepository.findOne({ where: { id } });
      if (!blog) {
        throw new NotFoundException(`blog   with ID ${id} not found`);
      }
      blog.status = !blog.status;
      //content.updatedBy = user.sub.toString(); // or user.sub.toString()
  
      const response = this.blogRepository.save(blog);
     await this.cacheService.deletePattern('Admin:blog:*');
     await this.cacheService.deletePattern('frontend:blog:*');
     return response;
    }

}
