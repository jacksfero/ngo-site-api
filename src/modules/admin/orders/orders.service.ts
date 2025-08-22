import { Injectable, NotFoundException } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Order } from 'src/shared/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
 
@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async findAll(
    paginationDto: OrderPaginationDto,
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    const { page, limit, search, status } = paginationDto;

    // console.log('page-------',page);
    // process.exit;

    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress');

    if (search) {
      query.andWhere('user.fullName LIKE :search OR user.email LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    const [result, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();
 
    const data = plainToInstance(OrderResponseDto, result, {
      excludeExtraneousValues: true,
    });
  
    return new PaginationResponseDto(data, { total, page, limit  });
  }


  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'shippingAddress'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    order.status = dto.status;
    await this.orderRepo.save(order);

    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: number): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    await this.orderRepo.remove(order);
  }
}
