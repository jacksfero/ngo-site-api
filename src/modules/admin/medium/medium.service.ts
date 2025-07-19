import { Injectable,NotFoundException } from '@nestjs/common';
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

  async create(createMediumDto: CreateMediumDto, user: any,): Promise<Medium> {
     const medium = this.mediumRepository.create({
      ...createMediumDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.mediumRepository.save(medium);
  }

  async findAll(): Promise<Medium[]> {
    return this.mediumRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      /* where: {
        status: true, // only active surfaces
      },*/
    });
  }

  async findOne(id: number): Promise<Medium> {
     const medium = await this.mediumRepository.findOne({ where: { id } });
     if (!medium) throw new NotFoundException(`Surface ${id} not found`);
     return medium;
   }

 async update(id: number, updateMediumDto: UpdateMediumDto, user: any):Promise<Medium> {
    const medium = await this.findOne(id);
    Object.assign(medium,updateMediumDto);
    medium.updatedBy = user.save.toString();
    return this.mediumRepository.save(medium);

  }

 
async remove(id: number): Promise<void> {
    const medium = await this.findOne(id);
    await this.mediumRepository.remove(medium);
  }

  // surface.service.ts
  async toggleStatus(id: number, user: any): Promise<Medium> {
    const medium = await this.mediumRepository.findOne({ where: { id } });
    if (!medium) {
      throw new NotFoundException(`Medium   with ID ${id} not found`);
    }
    medium.status = !medium.status;
    medium.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.mediumRepository.save(medium);
  }
}
