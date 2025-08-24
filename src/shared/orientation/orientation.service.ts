import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
 
import { CreateOrientationDto } from './dto/create-orientation.dto';
import { UpdateOrientationDto } from './dto/update-orientation.dto';
import { Orientation } from '../entities/orientation.entity';

@Injectable()
export class OrientationService {
  constructor(
    @InjectRepository(Orientation)
    private orientationRepo: Repository<Orientation>,
  ) {}

  async create(dto: CreateOrientationDto): Promise<Orientation> {
    const orientation = this.orientationRepo.create(dto);
    return this.orientationRepo.save(orientation);
  }

  async update(id: number, dto: UpdateOrientationDto): Promise<Orientation> {
    const orientation = await this.findOne(id);
    if(!orientation)
  {
   throw new NotFoundException("Orientation Not found");

  }  Object.assign(orientation, dto);
    return this.orientationRepo.save(orientation);
  }
  

  async findAll() {
    return this.orientationRepo.find();
  }

  
  async findOne(id: number): Promise<Orientation> {
    const size = await this.orientationRepo.findOne({ where: { id } });
    if (!size) throw new NotFoundException(`Size with id ${id} not found`);
    return size;
  }

  async remove(id: number) {
    return this.orientationRepo.delete(id);
  }
}
