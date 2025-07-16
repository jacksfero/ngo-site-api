import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/shared/entities/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    console.log();
    const result = await this.blogRepository.save(createBlogDto);
    return result;
  }

  async findAll(): Promise<Blog[]> {
    const result = await this.blogRepository.find();
    return result;
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

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
