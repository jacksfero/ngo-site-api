import { ConflictException, Injectable,NotFoundException } from '@nestjs/common';
import { CreateMediumDto } from './dto/create-medium.dto';
import { UpdateMediumDto } from './dto/update-medium.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Medium } from '../../../shared/entities/medium.entity';
import { MediumResponseDto } from './dto/medium-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MediumService {
  constructor(
    @InjectRepository(Medium)
    private mediumRepository: Repository<Medium>,
  ) {}

  async create(createMediumDto: CreateMediumDto, user: any,): Promise<Medium> {
  
  // Check if medium name already exists
  const existingMedium = await this.mediumRepository.findOne({
    where: { name: createMediumDto.name.trim() },
  });

  if (existingMedium) {
    throw new ConflictException('Medium name already exists');
  }
    const medium = this.mediumRepository.create({
      ...createMediumDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.mediumRepository.save(medium);
  }
  async getActiveList():  Promise<MediumResponseDto[]> {
    const medium = await this.mediumRepository.find({
      order: { name: 'ASC' }
    });
    return plainToInstance(MediumResponseDto, medium, {
      excludeExtraneousValues: true,
    });
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
  
  // Check if new name conflicts with other media
  if (updateMediumDto.name) {
    const existingMedium = await this.mediumRepository.findOne({
      where: {
        name: updateMediumDto.name.trim(),
        id: Not(id), // Exclude current medium from check
      },
    });

    if (existingMedium) {
      throw new ConflictException('Medium name already exists');
    }
  }
  
  const medium = await this.findOne(id);
    Object.assign(medium,updateMediumDto);
    medium.updatedBy = user.sub.toString();
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

  async validateMediumName(name: string, excludeId?: number): Promise<boolean> {
    const where: any = { name: name.trim() };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    
    const existing = await this.mediumRepository.findOne({ where });
    return !existing;
  }
}
