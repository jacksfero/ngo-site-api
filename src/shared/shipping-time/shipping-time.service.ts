// shipping-time.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { CreateShippingTimeDto } from './dto/create-shipping-time.dto';
import { UpdateShippingTimeDto } from './dto/update-shipping-time.dto';
import { ShippingTime } from '../entities/shipping-time.entity';

@Injectable()
export class ShippingTimeService {
  constructor(
    @InjectRepository(ShippingTime)
    private readonly shippingTimeRepo: Repository<ShippingTime>,
  ) {}

  // ✅ Create
  async create(dto: CreateShippingTimeDto): Promise<ShippingTime> {
    const shippingTime = this.shippingTimeRepo.create(dto);
    return await this.shippingTimeRepo.save(shippingTime);
  }

  // ✅ Update
  async update(id: number, dto: UpdateShippingTimeDto): Promise<ShippingTime> {
    const shippingTime = await this.shippingTimeRepo.findOne({ where: { id } });
    if (!shippingTime) {
      throw new NotFoundException(`ShippingTime with ID ${id} not found`);
    }
    Object.assign(shippingTime, dto);
    return await this.shippingTimeRepo.save(shippingTime);
  }

  // ✅ Find All
  async findAll(): Promise<ShippingTime[]> {
    const commissionTypes = await this.shippingTimeRepo.find({ 
      where: { isActive: true } 
    });
    
    if (commissionTypes.length === 0) {
      throw new NotFoundException('No active commission types found');
    }
    
    return commissionTypes;
  }

  // ✅ Find One
  async findOne(id: number): Promise<ShippingTime> {
    const shippingTime = await this.shippingTimeRepo.findOne({ where: { id } });
    if (!shippingTime) {
      throw new NotFoundException(`ShippingTime with ID ${id} not found`);
    }
    return shippingTime;
  }

  // ✅ Delete
  async remove(id: number): Promise<void> {
    const result = await this.shippingTimeRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ShippingTime with ID ${id} not found`);
    }
  }
}
