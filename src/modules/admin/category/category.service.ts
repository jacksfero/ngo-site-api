import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'src/shared/entities/category.entity';
import { slugify } from 'src/shared/utils/slugify';
import { plainToInstance } from 'class-transformer';
import { BlogcategoryResponseDto } from './dto/blog-cat-res-dto';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
     private cacheService: CacheService,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

  ) { }

  async create(createCategoryDto: CreateCategoryDto, user: any): Promise<Category> {
    const uniqueSlug = await this.generateUniqueSlug(createCategoryDto.name);
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
      slug: uniqueSlug,
    });
    return this.categoryRepository.save(category);
  }

  async getActiveList(): Promise<BlogcategoryResponseDto[]> {
     const cacheKey = 'Admin:category:active';
    
         // ✅ 1. Try cache first
       const cached = await this.cacheService.get<BlogcategoryResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      } // ✅ 2. Fetch from DB if not cached
    const surfaces = await this.categoryRepository.find({
      order: { name: 'ASC' },
      where: {
        status: true, // only active surfaces
      }
    });
    const response = plainToInstance(BlogcategoryResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
    // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, response, { ttl: 93600 });

  return response;
  }
  async findAll(): Promise<Category[]> {
    const cacheKey = 'Admin:category:all';
       
      const cached = await this.cacheService.get<Category[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const response = await this.categoryRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      /* where: {
        status: true, // only active surfaces
      },*/
    });

    // ✅ 3. Store in cache for 1 hour
  await this.cacheService.set(cacheKey, response, { ttl: 3600 });

  return response;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`category ${id} not found`);
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException(`category ${id} not found`);
 
    if (updateCategoryDto.name && category.name !== updateCategoryDto.name) {
      const uniqueSlug = await this.generateUniqueSlug(updateCategoryDto.name);
      category.slug = uniqueSlug;
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);

  }


  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  // surface.service.ts
  async toggleStatus(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`category   with ID ${id} not found`);
    }
    category.status = !category.status;
    //medium.updatedBy = user.sub.toString(); // or user.sub.toString()
await this.cacheService.deletePattern('Admin:category:*');
    return this.categoryRepository.save(category);
  }

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (await this.categoryRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }
}
