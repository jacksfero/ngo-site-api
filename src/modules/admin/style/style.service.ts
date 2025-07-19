import { Injectable } from '@nestjs/common';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Style } from '../../../shared/entities/style.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StyleService {
  constructor(
    @InjectRepository(Style)
    private styleRepository: Repository<Style>,
  ) {}

  async create(createStyleDto: CreateStyleDto,user: any): Promise<Style> {

      const style = this.styleRepository.create({
      ...createStyleDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.styleRepository.save(style);
 
  }

  async findAll(): Promise<Style[]> {
    const result = await this.styleRepository.find();
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} style`;
  }

  update(id: number, updateStyleDto: UpdateStyleDto) {
    return `This action updates a #${id} style`;
  }

  remove(id: number) {
    return `This action removes a #${id} style`;
  }
}
