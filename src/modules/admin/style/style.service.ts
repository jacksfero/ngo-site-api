import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Style } from '../../../shared/entities/style.entity';
import { Not, Repository } from 'typeorm';
import e from 'express';
import { plainToInstance } from 'class-transformer';
import { StyleResponseDto } from './dto/style-response.dto';

@Injectable()
export class StyleService {
  constructor(
    @InjectRepository(Style)
    private styleRepository: Repository<Style>,
  ) { }

  async create(createStyleDto: CreateStyleDto, user: any): Promise<Style> {
 // Check for existing style with same title
 const existingStyle = await this.styleRepository.findOne({
  where: { title: createStyleDto.title.trim() },
});

if (existingStyle) {
  throw new ConflictException('Style title already exists');
}
    const style = this.styleRepository.create({
      ...createStyleDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.styleRepository.save(style);

  }
  async getActiveList():  Promise<StyleResponseDto[]> {
    const surfaces = await this.styleRepository.find({
      order: { title: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(StyleResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
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
    
  // Check for title conflict when title is being updated
  if (updateStyleDto.title) {
    const existingStyle = await this.styleRepository.findOne({
      where: {
        title: updateStyleDto.title.trim(),
        id: Not(id), // Exclude current style from check
      },
    });

    if (existingStyle) {
      throw new ConflictException('Style title already exists');
    }
  }
  
  
  
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
    async validateStyleTitle(title: string, excludeId?: number): Promise<boolean> {
      const where: any = { title: title.trim() };
      if (excludeId) {
        where.id = Not(excludeId);
      }
      
      const existing = await this.styleRepository.findOne({ where });
      return !existing;
    }
}
