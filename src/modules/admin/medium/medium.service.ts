import { Injectable } from '@nestjs/common';
import { CreateMediumDto } from './dto/create-medium.dto';
import { UpdateMediumDto } from './dto/update-medium.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medium } from '../../../shared/entities/medium.entity';

@Injectable()
export class MediumService {
  constructor(
    @InjectRepository(Medium)
    private mediumRepository: Repository<Medium>,
  ) {}

  async create(createMediumDto: CreateMediumDto): Promise<Medium> {
    return this.mediumRepository.save(createMediumDto);
  }

  async findAll(): Promise<Medium[]> {
    return this.mediumRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} medium`;
  }

  update(id: number, updateMediumDto: UpdateMediumDto) {
    return `This action updates a #${id} medium`;
  }

  remove(id: number) {
    return `This action removes a #${id} medium`;
  }
}
