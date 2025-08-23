// modules/commission-type/commission-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionType } from 'src/shared/entities/commission-type.entity';
import { CreateCommissionTypeDto } from './dto/create-commision-type.dto';
import { UpdateCommisionTypeDto } from './dto/update-commision-type.dto';

@Injectable()
export class CommissionTypeService {
  constructor(
    @InjectRepository(CommissionType)
    private repo: Repository<CommissionType>,
  ) {}

    // ✅ Create
    async create(dto: CreateCommissionTypeDto): Promise<CommissionType> {
      const commissionType = this.repo.create(dto);
      return await this.repo.save(commissionType);
    }
  
    // ✅ Edit (Update)
    async update(id: number, dto: UpdateCommisionTypeDto): Promise<CommissionType> {
      const commissionType = await this.repo.findOne({ where: { id } });
      if (!commissionType) {
        throw new NotFoundException(`CommissionType with ID ${id} not found`);
      }
  
      Object.assign(commissionType, dto);
      return await this.repo.save(commissionType);
    }


    async findAll(): Promise<CommissionType[]> {
      const commissionTypes = await this.repo.find({ 
        where: { isActive: true } 
      });
      
      if (commissionTypes.length === 0) {
        throw new NotFoundException('No active commission types found');
      }
      
      return commissionTypes;
    }

  async findOne(id: number): Promise<CommissionType> {
    return this.repo.findOneOrFail({ where: { id } });
  }
}