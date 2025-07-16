// modules/client/blog/blog-client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../shared/entities/blog.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BlogClientService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async findAllPublished() {
    const blogs = await this.blogRepo.find({
      where: { isPublished: false },
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(Blog, blogs, { groups: ['client'] });
  }

  async findOnePublished(id: number) {
    const blog = await this.blogRepo.findOne({
      where: {
        id,
        isPublished: false,
      },
    });
    if (!blog) throw new NotFoundException();
    return plainToInstance(Blog, blog, { groups: ['client'] });
  }
}
