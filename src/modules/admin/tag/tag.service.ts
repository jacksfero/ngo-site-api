import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/shared/entities/tag.entity';
import { Repository } from 'typeorm';
import { slugify } from 'src/shared/utils/slugify';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag)
  private tagRepository: Repository<Tag>
){}
  async create(createTagDto: CreateTagDto):Promise<Tag> {

    const uniqueSlug = await this.generateUniqueSlug(createTagDto.name);
     const tag = await this.tagRepository.create({name:createTagDto.name,slug:uniqueSlug});
    return this.tagRepository.save(tag);
  }

async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (await this.tagRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

 async findAll() :Promise<Tag[]>{
  const tag = await this.tagRepository.find({
    order: {
      id: 'DESC', // sort by newest first
    },
  });
    return tag;
  }

 async findOne(id: number):Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag ${id} not found`);
    }
  }
}
