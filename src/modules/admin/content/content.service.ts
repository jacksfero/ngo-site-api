import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CacheService } from 'src/core/cache/cache.service';
import { ContentPage as Content } from 'src/shared/entities/content-page.entity';
import { slugify } from 'src/shared/utils/slugify';
import { ContentStatus } from './enums/content.status.enum';
import { ContentPaginationDto } from './dto/content-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ContentListDto } from './dto/content-list.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ContentService {
  constructor(
    private cacheService: CacheService,

    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) { }

  async create(dto: CreateContentDto, siteId: number, userId?: number) {



    const slug = await this.ensureSlugUnique(siteId, dto.title);
    console.log(`slug------------${slug}`);

    const content = this.contentRepository.create({
      ...dto,
      slug: slug,
      site: { id: siteId },
      createdBy: { id: userId }
    });

    const result = await this.contentRepository.save(content);

    await this.clearCache(siteId);

    return result;
  }

  async findAll(paginationDto: ContentPaginationDto, siteId: number):
    Promise<PaginationResponseDto<ContentListDto>> {
    const { page, limit, search, status, } = paginationDto;
    const skip = (page - 1) * limit;
    const cacheKey = `Admin:Content:${siteId}:${JSON.stringify(paginationDto)}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as PaginationResponseDto<ContentListDto>;
    }
    // const result = await this.contentRepository.find({
    //   where: { site: { id: siteId } },
    //   order: { id: 'DESC' },
    // });
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content').where('content.site = :siteId', { siteId })
      .orderBy('content.id', 'DESC')
      .take(limit)
      .skip(skip);
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.mobile) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (typeof status === 'boolean') {
      //console.log('status----------',status)
      queryBuilder.andWhere('user.status = :status', { status });
    }
const [result, total] = await queryBuilder.getManyAndCount();
 const data = plainToInstance(ContentListDto, result, {
      excludeExtraneousValues: true,
    });
    const response = new PaginationResponseDto(data, { total, page, limit });
     await this.cacheService.set(cacheKey, response);
    return response;
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
    let uniqueSlug = baseSlug;
    let count = 1;

    while (await this.contentRepository.findOne({
      where: { site: { id: siteId }, slug: uniqueSlug }, select: ['id']
    })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }
    return uniqueSlug;
  }


  private async clearCache(siteId: number) {
    await this.cacheService.deletePattern(`Admin:Content:${siteId}*`);
  }
}
