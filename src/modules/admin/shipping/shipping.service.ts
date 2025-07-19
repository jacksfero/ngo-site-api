import { Injectable, NotFoundException} from '@nestjs/common';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from '../../../shared/entities/shipping.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
  ) {}

  async create(createShippingDto: CreateShippingDto,user:any): Promise<Shipping> {
     try {
      const shipping = this.shippingRepository.create({
      ...createShippingDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.shippingRepository.save(shipping);
    } catch (error) {
      throw new  error("shipping No save ")
    }
  }

  async findAll(): Promise<Shipping[]> {
    const result = await this.shippingRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      }
    });
    return result;
  }

 async findOne(id: number) {
    const shipping = await this.shippingRepository.findOne({ where: { id } });
    if (!shipping) throw new NotFoundException(`shipping ${id} not found`);
    return shipping;
  }

 async update(id: number, updateShippingDto: UpdateShippingDto,user:any) {
      const shipping = await this.findOne(id);
    Object.assign(shipping, updateShippingDto);
    shipping.updatedBy = user.sub.toString(); // or user.sub.toString()
    return this.shippingRepository.save(shipping);
  }

async  remove(id: number): Promise<void> {
    const shipping = await this.findOne(id);
    if (!shipping) throw new NotFoundException(`shipping ${id} not found`);
    await this.shippingRepository.remove(shipping);
  }

  async toggleStatus(id: number, user: any): Promise<Shipping> {
      const shipping = await this.shippingRepository.findOne({ where: { id } });
      if (!shipping) {
        throw new NotFoundException(`shipping with ID ${id} not found`);
      }
      shipping.status = !shipping.status;
      shipping.updatedBy = user.sub.toString(); // or user.sub.toString()
  
      return this.shippingRepository.save(shipping);
    }
  
}
