import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateSurfaceDto } from './dto/create-surface.dto';
import { UpdateSurfaceDto } from './dto/update-surface.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Surface } from '../../../shared/entities/surface.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

UseGuards(JwtAuthGuard);
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

  async create(
    createSurfaceDto: CreateSurfaceDto,
    user: any,
  ): Promise<Surface> {
    const surface = this.surfaceRepository.create({
      ...createSurfaceDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.surfaceRepository.save(surface);
  }

  async findAll(): Promise<Surface[]> {
    return this.surfaceRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      /* where: {
        status: true, // only active surfaces
      },*/
    });
  }

  async findOne(id: number): Promise<Surface> {
    const surface = await this.surfaceRepository.findOne({ where: { id } });
    if (!surface) throw new NotFoundException(`Surface ${id} not found`);
    return surface;
  }

  async update(id: number, dto: UpdateSurfaceDto, user: any): Promise<Surface> {
    const surface = await this.findOne(id);
    Object.assign(surface, dto);
    surface.updatedBy = user.sub.toString(); // or user.sub.toString()
    return this.surfaceRepository.save(surface);
  }

  async remove(id: number): Promise<void> {
    const surface = await this.findOne(id);
    await this.surfaceRepository.remove(surface);
  }

  // surface.service.ts
  async toggleStatus(id: number, user: any): Promise<Surface> {
    const surface = await this.surfaceRepository.findOne({ where: { id } });
    if (!surface) {
      throw new NotFoundException(`Surface with ID ${id} not found`);
    }
    surface.status = !surface.status;
    surface.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.surfaceRepository.save(surface);
  }
}
