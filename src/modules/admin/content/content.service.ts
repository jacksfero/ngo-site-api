import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from '../../../shared/entities/content.entity';
import { Repository } from 'typeorm';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class ContentService {
  constructor(
      private cacheService: CacheService,

    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) { }

  async create(createContentDto: CreateContentDto, user: any): Promise<Content> {
    const content = await this.contentRepository.create({
      ...createContentDto,
      createdBy: user.sub.toString()
    })

    const result = await this.contentRepository.save(content);
    return result;
  }

  async findAll(): Promise<Content[]> {
      const cacheKey = 'Admin:Content:all';
       
      const cached = await this.cacheService.get<Content[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const result = await this.contentRepository.find({
      order: {
        id: 'DESC', // sort by newest first
      },

    });    
    await this.cacheService.set(cacheKey, result, { ttl: 93600 });
 
    return result;
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } })
    if (!content) throw new NotFoundException(`content ${id} not found`);
    return content;
  }

  async update(id: number, updateContentDto: UpdateContentDto, user: any): Promise<Content> {

    const content = await this.findOne(id)
    if (!content) throw new NotFoundException(`content ${id} not found`);
    Object.assign(content, updateContentDto);
    content.updatedBy = user.sub.toString();
    return this.contentRepository.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }

  // content.service.ts
  async toggleStatus(id: number, user: any): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`content   with ID ${id} not found`);
    }
    content.status = !content.status;
    content.updatedBy = user.sub.toString(); // or user.sub.toString()
 await this.cacheService.deletePattern('Admin:Content:*');
    return this.contentRepository.save(content);
  }



}
