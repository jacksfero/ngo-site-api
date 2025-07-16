import { Injectable } from '@nestjs/common';
import { CreateSurfaceDto } from './dto/create-surface.dto';
import { UpdateSurfaceDto } from './dto/update-surface.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Surface } from '../../../shared/entities/surface.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SurfaceService {
  constructor(
    @InjectRepository(Surface)
    private surfaceRepository: Repository<Surface>,
  ) {}

  // create(createSurfaceDto: CreateSurfaceDto) {
  //   return 'This action adds a new surface';
  // }
  // create(surface: Partial<Surface>) {

  async create(createSurfaceDto: CreateSurfaceDto): Promise<Surface> {
    return this.surfaceRepository.save(createSurfaceDto);
  }

  async findAll(): Promise<Surface[]> {
    
    return this.surfaceRepository.find();
  }

  findOne(id: number) {
    return `This actxxddddddddddddddd returns a #${id} surface`;
  }

  update(id: number, updateSurfaceDto: UpdateSurfaceDto) {
    return `This action updates a #${id} surface`;
  }

  remove(id: number) {
    return `This action removes a #${id} surface`;
  }
}
