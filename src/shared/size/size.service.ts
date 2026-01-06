import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from '../entities/size.entity';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepo: Repository<Size>,
  ) {}
  async create(dto: CreateSizeDto): Promise<Size> {
    const size = this.sizeRepo.create(dto);
    return this.sizeRepo.save(size);
  }

  async findAll(activeOnly = false): Promise<Size[]> {
    if (activeOnly) {
      return this.sizeRepo.find({ where: { status: true } });
    }
   // console.log(`size----------------`,this.sizeRepo.find());
    return this.sizeRepo.find();
  }
  async findOne(id: number): Promise<Size> {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) throw new NotFoundException(`Size with id ${id} not found`);
    return size;
  }

  async update(id: number, dto: UpdateSizeDto): Promise<Size> {
    const size = await this.findOne(id);
    Object.assign(size, dto);
    return this.sizeRepo.save(size);
  }

  async remove(id: number): Promise<void> {
    const size = await this.findOne(id);
    await this.sizeRepo.remove(size);
  }
  

}
