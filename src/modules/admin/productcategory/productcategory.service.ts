import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductcategoryDto } from './dto/create-productcategory.dto';
import { UpdateProductcategoryDto } from './dto/update-productcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { slugify } from 'src/shared/utils/slugify';
import { plainToInstance } from 'class-transformer';
import { ProductcategoryResponseDto } from './dto/pcate-res.dto';

@Injectable()
export class ProductcategoryService {

  constructor(
    @InjectRepository(Productcategory)
    private procateRepository: Repository<Productcategory>,
  ) { }


  async create(createProductcategoryDto: CreateProductcategoryDto, user: any): Promise<Productcategory> {

    const uniqueSlug = await this.generateUniqueSlug(createProductcategoryDto.name);

    const procat = this.procateRepository.create({
      ...createProductcategoryDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
      slug: uniqueSlug
    });
    return this.procateRepository.save(procat);
  }

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (await this.procateRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }
  async getActiveList():  Promise<ProductcategoryResponseDto[]> {
    const surfaces = await this.procateRepository.find({
      order: { id: 'DESC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(ProductcategoryResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<Productcategory[]> {
    return this.procateRepository.find({
      order: {
        id: 'DESC', // sort by newest first
      },
      /*  where: {
         status: true, // only active surfaces
       }, */
    });
  }


  async findOne(id: number): Promise<Productcategory> {
    const surface = await this.procateRepository.findOne({ where: { id } });
    if (!surface) throw new NotFoundException(`Product category ${id} not found`);
    return surface;
  }

  async update(id: number, dto: UpdateProductcategoryDto, user: any): Promise<Productcategory> {

    const blog = await this.findOne(id);
    if (!blog) throw new NotFoundException('Category not found');
    if (dto.name && dto.name !== blog.name) {
      blog.slug = await this.generateUniqueSlug(dto.name);
      blog.name = dto.name;
    }
    blog.updatedBy = user.sub.toString(); // or user.sub.toString()
    return this.procateRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const surface = await this.findOne(id);
    await this.procateRepository.remove(surface);
  }

  // surface.service.ts
  async toggleStatus(id: number, user: any): Promise<Productcategory> {
    const surface = await this.procateRepository.findOne({ where: { id } });
    if (!surface) {
      throw new NotFoundException(`Product category with ID ${id} not found`);
    }
    surface.status = !surface.status;
    surface.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.procateRepository.save(surface);
  }
}
