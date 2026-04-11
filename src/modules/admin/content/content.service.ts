import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
 
import { Repository } from 'typeorm';
import { CacheService } from 'src/core/cache/cache.service';
import { ContentPage as Content } from 'src/shared/entities/content-page.entity';
import { slugify } from 'src/shared/utils/slugify';
import { ContentStatus } from './enums/content.status.enum';

@Injectable()
export class ContentService {
  constructor(
      private cacheService: CacheService,

    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) { }

  async create(dto: CreateContentDto, siteId: number, userId?: number) {

 

   const slug =  await this.ensureSlugUnique(siteId, dto.title);

    const content = this.contentRepository.create({
      ...dto,
      slug:slug,
      site: { id: siteId },
      createdBy: { id: userId }
    });

    const result = await this.contentRepository.save(content);

    await this.clearCache(siteId);

    return result;
  }

async findAll(siteId: number): Promise<Content[]> {

    const cacheKey = `Admin:Content:${siteId}`;

    const cached = await this.cacheService.get<Content[]>(cacheKey);
    if (cached?.length) return cached;

    const result = await this.contentRepository.find({
      where: { site: { id: siteId } },
      order: { id: 'DESC' },
    });

    await this.cacheService.set(cacheKey, result, { ttl: 3600 });

    return result;
  }

  async findOne(id: number, siteId: number): Promise<Content> {

    const content = await this.contentRepository.findOne({
      where: { id, site: { id: siteId } },
    });

    if (!content) throw new NotFoundException(`Content ${id} not found`);

    return content;
  }

 async update(
  id: number,
  dto: UpdateContentDto,
  siteId: number,
  userId?: number,
) {

  const content = await this.findOne(id, siteId);

  if (dto.slug && dto.slug !== content.slug) {
    await this.ensureSlugUnique(siteId, dto.slug);
  }

  Object.assign(content, dto);

  if (userId) {
    content.updatedBy = { id: userId } as any;
  }

  const result = await this.contentRepository.save(content);

  await this.clearCache(siteId);

  return result;
}

  // ✅ DELETE
  async remove(id: number, siteId: number) {

    const content = await this.findOne(id, siteId);

    await this.contentRepository.remove(content);

    await this.clearCache(siteId);
  }

  // ✅ TOGGLE STATUS (FIXED)
async toggleStatus(
  id: number,
  siteId: number,
  userId?: number,
) {

  const content = await this.contentRepository.findOne({
    where: {
      id,
      site: { id: siteId },
    },
  });

  if (!content) {
    throw new NotFoundException(`Content ${id} not found`);
  }

  // ✅ toggle enum status
  content.status =
    content.status === ContentStatus.PUBLISHED
      ? ContentStatus.DRAFT
      : ContentStatus.PUBLISHED;

  // ✅ assign relation (correct way)
  if (userId) {
    content.updatedBy = { id: userId } as any;
  }

  const result = await this.contentRepository.save(content);

  await this.clearCache(siteId);

  return result;
}


 private async ensureSlugUnique(siteId: number, slug: string) {
    const baseSlug = slugify(slug);
   
    let count = 1;

     while (await this.contentRepository.findOne({
      where: { site: { id: siteId },slug: baseSlug },
    })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;

}


    private async clearCache(siteId: number) {
    await this.cacheService.deletePattern(`Admin:Content:${siteId}*`);
  }
}
