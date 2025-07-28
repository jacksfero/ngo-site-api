import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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


@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) { }

  async create(dto: CreateBlogDto, user: any, imageFilename?: string): Promise<Blog> {

    const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Category not found');

    const tags = await this.tagRepository.findBy({ id: In(dto.tagIds || []) });
console.log(imageFilename,'creat--------------------')
   
    const author = await this.userRepository.findOneBy({ id: user.sub.toString() });
    if (!author) throw new NotFoundException('Author not found');

    const uniqueSlug = await this.generateUniqueSlug(dto.title);

    const blog = this.blogRepository.create({
      title: dto.title,
      slug: uniqueSlug,
      h1Title: dto.h1Title,
      blogContent: dto.blogContent,
      // titleImage:dto.titleImage,
      titleImage: imageFilename ? `/blog-images/${imageFilename}` : null,
      status: true,
      isPublished: true,
      scheduledPublishDate: dto.scheduledPublishDate || null,
      category,
      tags,
      author,
    });
    return this.blogRepository.save(blog);

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

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({
       relations: ['category', 'tags', 'author'],
      order: { createdAt: 'DESC' },
    });

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

  async update(id: number, dto: UpdateBlogDto,imageFilename?: string): Promise<Blog> {
    const blog = await this.findOne(id);
     if (!blog) throw new NotFoundException('blog not found');
     if (dto.title && dto.title !== blog.title) {
    blog.slug = await this.generateUniqueSlug(dto.title);
    blog.title = dto.title;
  }

    blog.h1Title = dto.h1Title ?? blog.h1Title;
  blog.blogContent = dto.blogContent ?? blog.blogContent;
   

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      blog.category = category;
    }

    if (dto.tagIds?.length) {
      blog.tags = await this.tagRepository.findBy({ id: In(dto.tagIds) });
    }
     // 1. Handle Image Update if New File is Provided
  // ✅ Delete old image if new one is uploaded
  if (imageFilename) {
    if (blog.titleImage) {
      const oldImagePath = path.join(__dirname, '..', '..',  '..', 'uploads',  blog.titleImage);
     console.log(oldImagePath,'--------------------');
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // deletes old image file
      }
    }

    blog.titleImage = `/blog-images/${imageFilename}`;
  }
 
    return this.blogRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Blog post not found');
    }
  }
}
