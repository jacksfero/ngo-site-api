// modules/packing-mode/packing-mode.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackingModeEntity } from 'src/shared/entities/packing-mode.entity';

@Injectable()
export class PackingModeService {
  constructor(
    @InjectRepository(PackingModeEntity)
    private readonly repo: Repository<PackingModeEntity>,
  ) {}

  async findAll(): Promise<PackingModeEntity[]> {
    const commissionTypes = await this.repo.find({ 
      where: { isActive: true } 
    });
    
    if (commissionTypes.length === 0) {
      throw new NotFoundException('No active Packing Mode   found');
    }
    
    return commissionTypes;
  }

  async create(name: string) {
    const mode = this.repo.create({ name });
    return this.repo.save(mode);
  }

  async update(id: number, name: string) {
    await this.repo.update(id, { name });
    return this.repo.findOneBy({ id });
  }

  async deactivate(id: number) {
    await this.repo.update(id, { isActive: false });
    return { success: true };
  }
}
