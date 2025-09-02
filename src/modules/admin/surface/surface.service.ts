import { ConflictException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateSurfaceDto } from './dto/create-surface.dto';
import { UpdateSurfaceDto } from './dto/update-surface.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Surface } from '../../../shared/entities/surface.entity';
import { Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SurfaceResponseDto } from './dto/surface-response.dto';



@Injectable()
export class SurfaceService {
  constructor(
    @InjectRepository(Surface)
    private surfaceRepository: Repository<Surface>,
  ) { }

  // create(createSurfaceDto: CreateSurfaceDto) {
  //   return 'This action adds a new surface';
  // }
  // create(surface: Partial<Surface>) {

  async create(
    createSurfaceDto: CreateSurfaceDto,
    user: any,
  ): Promise<Surface> {


    // Check if surface name already exists
    const existingSurface = await this.surfaceRepository.findOne({
      where: { surfaceName: createSurfaceDto.surfaceName.trim() },
    });

    if (existingSurface) {
      throw new ConflictException('Surface name already exists');
    }

    const surface = this.surfaceRepository.create({
      ...createSurfaceDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.surfaceRepository.save(surface);
  }

  async getActiveList(): Promise<SurfaceResponseDto[]> {
    const surfaces = await this.surfaceRepository.find({
      order: { surfaceName: 'ASC' },
       where: {
        status: true, // only active surfaces
      }
    });
    return plainToInstance(SurfaceResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
  }
  async findAll(): Promise<Surface[]> {
    return this.surfaceRepository.find({
      order: {
        id: 'DESC', // sort by newest first
      },
      //  where: {
      //   status: true, // only active surfaces
      // },   
    });
  }

  async findOne(id: number): Promise<Surface> {
    const surface = await this.surfaceRepository.findOne({ where: { id } });
    if (!surface) throw new NotFoundException(`Surface ${id} not found`);
    return surface;
  }

  async update(id: number, dto: UpdateSurfaceDto, user: any): Promise<Surface> {

    // Check if new name conflicts with other surfaces
    if (dto.surfaceName) {
      const existingSurface = await this.surfaceRepository.findOne({
        where: {
          surfaceName: dto.surfaceName.trim(),
          id: Not(id), // Exclude current surface from check
        },
      });

      if (existingSurface) {
        throw new ConflictException('Surface name already exists');
      }
    }

    // await this.surfaceRepository.update(id, {
    //   ...updateSurfaceDto,
    //   updatedBy,
    // });

    // return this.surfaceRepository.findOne({ where: { id } });


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

  async validateSurfaceName(name: string, excludeId?: number): Promise<boolean> {
    const where: any = { surfaceName: name.trim() };
    if (excludeId) {
      where.id = Not(excludeId);
    }

    const existing = await this.surfaceRepository.findOne({ where });
    return !existing;
  }
}

