import { Injectable, NotFoundException } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Order } from 'src/shared/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderPaymentFailedPayload } from 'src/shared/events/interfaces/event-payload.interface';
 
 
@Injectable()
export class OrdersService {

  constructor(
    
    private readonly eventEmitter: EventEmitter2,
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
     // .leftJoinAndSelect('order.items', 'items')
    //  .leftJoinAndSelect('order.shippingAddress', 'shippingAddress');

    if (search) {
      query.andWhere('user.username LIKE :search OR user.email LIKE :search', {
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
      relations: ['user', 'items','items.product'  ],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({ where: { id },
     relations: [
        'user'
  ], });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    order.status = dto.status;
    await this.orderRepo.save(order);
     const date = new Date(order.createdAt);

const formattedDateTime =
  date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/,/g, '') +
  ' at ' +
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
const items = order.items.map((item) => ({
  productName: item.productName,
  // quantity: item.quantity,
  // price: String(item.price),
  // total: String(item.price * item.quantity),
  // image: item.imageUrl, // if exists
}));
      const payload: OrderPaymentFailedPayload = {  
            context: {   
            },   
            orderId:  String (order.id),
            currency:String (order.currency),
             totalAmount: String(order.totalAmount),  
             orderDate:String(formattedDateTime),
             paymentGatway:order.payments[0].paymentGateway	,
             paymentStatus:order.paymentStatus	,orderStatus:order.status	,
             name: order.user.username,
             to: order.user.email, 
              items,
           // testingNote: 'Testing product update flow',
          };
          this.eventEmitter.emit('order.update', payload);  

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
