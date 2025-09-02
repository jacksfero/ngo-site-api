import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from 'src/shared/entities/order.entity';
import { OrderItem } from 'src/shared/entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from 'src/shared/entities/user.entity';
import { Inventory } from 'src/shared/entities/inventory.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) 
    private orderRepo: Repository<Order>,
    
    @InjectRepository(OrderItem) 
    private orderItemRepo: Repository<OrderItem>,
    
    @InjectRepository(Cart) 
    private cartRepo: Repository<Cart>,
    
    @InjectRepository(CartItem) 
    private cartItemRepo: Repository<CartItem>,
    
    @InjectRepository(User) 
    private userRepo: Repository<User>,
    
    @InjectRepository(Inventory) 
    private inventoryRepo: Repository<Inventory>,
    
    private dataSource: DataSource, // ✅ For transactions
  ) {}


  async createFromCart(userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ Convert string userId to number if needed
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const cart = await this.cartRepo.findOne({
        where: { user: { id: numericUserId }, isCheckedOut: false },
        relations: ['user', 'items', 'items.product', 'items.product.inventory'],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
       // ✅ FIX: Define the type for inventoryUpdates array
       interface InventoryUpdate {
        inventoryId: number;
        newQuantity: number;
      }
      // ✅ Validate inventory and calculate total
      let total = 0;
      const inventoryUpdates: InventoryUpdate[] = []; // ✅ Explicit type
      
      for (const cartItem of cart.items) {
        if (!cartItem.inventoryId) {
          throw new BadRequestException(`Inventory not found for product: ${cartItem.product.productTitle}`);
        }

        const inventory = await this.inventoryRepo.findOne({
          where: { id: cartItem.inventoryId }
        });

        if (!inventory) {
          throw new BadRequestException(`Inventory not found for product: ${cartItem.product.productTitle}`);
        }

      if (inventory.quantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${cartItem.product.productTitle}. Available: ${inventory.quantity}`
          );
        }  

        // ✅ Use cart item price (inventory price) not product.artist_price
        const itemTotal = cartItem.quantity * cartItem.price;
        total += itemTotal;

       

        // Track inventory updates
        inventoryUpdates.push({
          inventoryId: inventory.id,
          newQuantity: inventory.quantity - cartItem.quantity
        });
      }

      // ✅ Create order
      const order = this.orderRepo.create({
        user: cart.user,
        items: [],
        totalAmount: total,
        status: OrderStatus.PENDING,
       // shippingAddress: cart.user.shippingAddress, // Add if available
      });

      // ✅ Create order items
      for (const cartItem of cart.items) {
        const orderItem = this.orderItemRepo.create({
          order,
          product: cartItem.product,
          quantity: cartItem.quantity,
          price: cartItem.price, // ✅ Use cart price (inventory price)
          originalPrice: cartItem.originalPrice, // Store original price
          discount: cartItem.discount, // Store discount
        });
        order.items.push(orderItem);
      }

      // ✅ Update inventory quantities
      for (const update of inventoryUpdates) {
        await this.inventoryRepo.update(
          { id: update.inventoryId },
          { quantity: update.newQuantity }
        );
      }

      // ✅ Mark cart as checked out
      cart.isCheckedOut = true;
      await this.cartRepo.save(cart);

      // ✅ Save order
      const savedOrder = await this.orderRepo.save(order);
      
      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


   async findAll(userId: string): Promise<Order[]> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.orderRepo.find({
      where: { user: { id: numericUserId } },
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }


  async findOne(userId: string, orderId: number): Promise<Order> {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: numericUserId } },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException('Order not found');

    // ✅ Additional logic for status changes
    if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    if (dto.status === OrderStatus.SHIPPED && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be shipped');
    }

    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  // // ✅ Optional: Add method to handle guest checkout
  // async createFromGuestCart(guestId: string, userData: any): Promise<Order> {
  //   // Similar to createFromCart but for guest users who just registered
  //   // You'll need to handle guest cart merging first
  // }
}
 
