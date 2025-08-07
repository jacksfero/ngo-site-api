import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Style } from '../../../shared/entities/style.entity';
import { Repository } from 'typeorm';
import e from 'express';

@Injectable()
export class StyleService {
  constructor(
    @InjectRepository(Style)
    private styleRepository: Repository<Style>,
  ) { }

  async create(createStyleDto: CreateStyleDto, user: any): Promise<Style> {

    const style = this.styleRepository.create({
      ...createStyleDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.styleRepository.save(style);

  }

  async findAll(): Promise<Style[]> {
    const result = await this.styleRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },

    });    
    return result;
  }

  async findOne(id: number): Promise<Style> {

    const style = await this.styleRepository.findOne({ where: { id } });
    if (!style) throw new NotFoundException(`style ${id} not found`);
    return style;

  }
    
  

 async update(id: number, updateStyleDto: UpdateStyleDto, user: any): Promise<Style> {
     const style = await this.findOne(id);
      
    if (!style) throw new NotFoundException(`style ${id} not found`);
     Object.assign(style, updateStyleDto);
     style.updatedBy = user.sub.toString()
    return this.styleRepository.save(style);

  }

 async remove(id: number) {
     const style = await this.findOne(id);
    return this.styleRepository.remove(style);
  }

  async toggleStatus(id: number, user: any): Promise<Style> {
      const style = await this.styleRepository.findOne({ where: { id } });
      if (!style) throw new NotFoundException(`style ${id} not found`);
      style.status = !style.status;
      style.updatedBy = user.sub.toString(); // or user.sub.toString()
  
      return this.styleRepository.save(style);
    }
  
}
