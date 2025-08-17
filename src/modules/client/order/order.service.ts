import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from 'src/shared/entities/order.entity';
import { OrderItem } from 'src/shared/entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private OrderitemRepo: Repository<OrderItem>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,

    @InjectRepository(User) 
    private  userRepo: Repository<User>,

  ) {}


  async createFromCart(userId: number): Promise<Order> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId }, isCheckedOut: false },
      relations: ['user', 'items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;
    const order = this.orderRepo.create({
      user: cart.user,
      items: [],
      totalAmount: 0,
      status: OrderStatus.PENDING,
    });

    for (const cartItem of cart.items) {
      const orderItem = this.OrderitemRepo.create({
        order,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.product.artist_price, // snapshot
      });

      total += cartItem.quantity * cartItem.product.artist_price;
      order.items.push(orderItem);
    }

    order.totalAmount = total;

    // mark cart as checked out
    cart.isCheckedOut = true;
    await this.cartRepo.save(cart);

    return this.orderRepo.save(order);
  }
  async findAll(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    return this.orderRepo.save(order);
  }
}
