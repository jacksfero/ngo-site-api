import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductcategoryDto } from './dto/create-productcategory.dto';
import { UpdateProductcategoryDto } from './dto/update-productcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { slugify } from 'src/shared/utils/slugify';

@Injectable()
export class ProductcategoryService {

   constructor(
      @InjectRepository(Productcategory)
      private procateRepository: Repository<Productcategory>,
    ) {}


  create(createProductcategoryDto: CreateProductcategoryDto,user:any):Promise<Productcategory> {
     const procat = this.procateRepository.create({
      ...createProductcategoryDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
      slug:slugify(createProductcategoryDto.name)
    });
    return this.procateRepository.save(procat);
  }

 async findAll(): Promise<Productcategory[]> {
    return this.procateRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
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
      const surface = await this.findOne(id);
      Object.assign(surface, dto);
      surface.updatedBy = user.sub.toString(); // or user.sub.toString()
      return this.procateRepository.save(surface);
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
