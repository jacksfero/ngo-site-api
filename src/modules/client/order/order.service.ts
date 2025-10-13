import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from 'src/shared/entities/order.entity';
import { OrderItem, OrderItemStatus } from 'src/shared/entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from 'src/shared/entities/user.entity';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { Shipping } from 'src/shared/entities/shipping.entity';
import { Payment, PaymentStatus } from 'src/shared/entities/payment.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

     @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

     @InjectRepository(Shipping)
    private shippingRepo: Repository<Shipping>,

    private dataSource: DataSource, // ✅ For transactions
  ) { }


  async createFromCart(
    userId: string,
    shippingAddressId?: number,
    billingAddressId?: number,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🟢 Starting checkout process for user:', userId);
      // 1️⃣ Convert userId to number
      const numericUserId = parseInt(userId, 10);

      console.log('🔢 Parsed user ID:', numericUserId);
      if (isNaN(numericUserId)) {
        throw new BadRequestException('Invalid user ID');
      }

      // 2️⃣ Get cart
      console.log('🛒 Fetching cart for user:', numericUserId);
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: numericUserId }, isCheckedOut: false },
        relations: ['user', 'items', 'items.product'], // Removed 'items.product.inventory'
      });
      console.log('📦 Cart found:', cart ? {
        id: cart.id,
        itemCount: cart.items?.length,
        isCheckedOut: cart.isCheckedOut
      } : 'No cart found');

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      // 3️⃣ Fetch addresses
      console.log('🏠 Fetching addresses...');
      console.log('📬 Shipping Address ID:', shippingAddressId);
      console.log('📭 Billing Address ID:', billingAddressId);
      // 3️⃣ Fetch addresses (FIXED)
      let shippingAddress: UsersAddress | null = null;
      let billingAddress: UsersAddress | null = null;

      if (shippingAddressId) {
        shippingAddress = await queryRunner.manager.findOne(UsersAddress, {
          where: { id: shippingAddressId },
          relations: ['user'],
        });
        console.log('📬 Shipping address found:', shippingAddress,
          'Not found');
        if (!shippingAddress) {
          throw new BadRequestException('Shipping address not found');
        }
      }

      if (billingAddressId) {
        billingAddress = await queryRunner.manager.findOne(UsersAddress, {
          where: { id: billingAddressId, user: { id: numericUserId } },
          relations: ['user'],
        });
        if (!billingAddress) {
          throw new BadRequestException('Billing address not found');
        }
      }

      // 4️⃣ Validate inventory & calculate totals
      let total = 0;
      const inventoryUpdates: { inventoryId: number; newQuantity: number }[] = [];
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        if (!cartItem.inventoryId) {
          throw new BadRequestException(
            `Inventory not found for product: ${cartItem.product.productTitle}`,
          );
        }

        const inventory = await queryRunner.manager.findOne(Inventory, {
          where: { id: cartItem.inventoryId },
        });

        if (!inventory) {
          throw new BadRequestException(
            `Inventory not found for product: ${cartItem.product.productTitle}`,
          );
        }

        if (inventory.quantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${cartItem.product.productTitle}. Available: ${inventory.quantity}`,
          );
        }

        const shiping = await queryRunner.manager.findOne(Shipping, {
           where: { id: inventory.shippingWeight.id }
        });
        if (!shiping) {
          throw new BadRequestException(
            `Shipping not found for product: `,
          );
        }
        // 💰 Calculate item total
        const itemTotal = cartItem.quantity * Number(cartItem.price);
        total += itemTotal;
        // 📦 Queue inventory update
        inventoryUpdates.push({
          inventoryId: inventory.id,
          newQuantity: inventory.quantity - cartItem.quantity,
        });
        // 📝 Build order item
        // 📝 Build order item
        const orderItem = queryRunner.manager.create(OrderItem, {
          product: cartItem.product,
          quantity: Number(cartItem.quantity) || 0,
          price: Number(cartItem.price) || 0,
          originalPrice: Number(cartItem.originalPrice) || 0,
          discountPct: Number(inventory.discount) || 0,
          discountAmount: Number(cartItem.discountAmount) || 0,
          gstPct: Number(inventory.gstSlot) || 0,
          gstAmount: Number(cartItem.gstAmount) || 0,
          shipGstPct: Number(inventory.shippingSlot) || 0,
          shipGstAmount: Number(cartItem.shipInr) || 0,
          shippingCost: Number(shiping.costINR) || 0,
          shippingCostOther: Number(shiping.CostOthers) || 0,
          shipGstAmountOther: Number(cartItem.shipOther) || 0,

          total: itemTotal,
          shippingId: shiping.id,
          inventoryId: cartItem.inventoryId,
          productName: cartItem.product.productTitle || '',
        });

        orderItems.push(orderItem);
      }
       
      // 5️⃣ Create order (FIXED ADDRESSES)
      const order = queryRunner.manager.create(Order, {
        user: { id: numericUserId } as User,
       items: orderItems,
        subtotal: total,
        totalAmount: total,
         country: cart.shippingCountry,
         exchangeRate:cart.exchangeRate,
         currency:cart.currency,
        shippingAddress: { id: shippingAddressId } as UsersAddress,  // Use actual entity
        billingAddress: { id: billingAddressId } as UsersAddress,    // Use actual entity
        status: OrderStatus.PENDING,
      });

      order.generateOrderNumber();
      // order.calculateTotals();
      const savedOrders = await queryRunner.manager.save(order);
      // 6️⃣ Create order items

      order.calculateTotals();

      // 7️⃣ Apply inventory updates
      for (const update of inventoryUpdates) {
        console.log(`📦 Updating inventory ID: ${update.inventoryId} to quantity: ${update.newQuantity}`);
        await queryRunner.manager.update(
          Inventory,
          { id: update.inventoryId },
          { quantity: update.newQuantity },
        );

      }

      // 8️⃣ Mark cart as checked out
      cart.isCheckedOut = true;
      await queryRunner.manager.save(cart);

      // 9️⃣ Save order & order items in one go
      const savedOrder = await queryRunner.manager.save(order);

      // 🔟 Commit
      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      console.error('❌ Checkout failed with error:', error);
      await queryRunner.rollbackTransaction();
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.error('Checkout error:', error); // Add logging for debugging
      throw new BadRequestException(`Checkout failed: ${error.message}`);
    } finally {
      await queryRunner.release();
      console.log('🔚 Query runner released');
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

async cancelOrderItems(orderId: number, itemIds: number[] | number, userId: number) {
 
 // 🔹 Ensure itemIds is always an array
  if (!Array.isArray(itemIds)) {
    itemIds = [Number(itemIds)];
  }
  
  const order = await this.orderRepo.findOne({
    where: { id: orderId },
    relations: ['items', 'payments'],
  });
  if (!order) throw new Error('Order not found');

  const itemsToCancel = order.items.filter((i) =>
    itemIds.includes(i.id),
  );

  if (itemsToCancel.length === 0)
    throw new Error('No valid items to cancel');

  // Calculate refund amount
  const refundAmount = itemsToCancel.reduce((sum, item) => sum + Number(item.price), 0);

  // Find successful payment
  const payment = order.payments.find((p) => p.status === PaymentStatus.SUCCESS);
  if (!payment) throw new Error('No payment found for refund');

  // Refund using Razorpay
 // const refund = await this.razorpayService.refundPayment(payment.gatewayPaymentId, refundAmount);

  // Update items
  for (const item of itemsToCancel) {
    item.status = OrderItemStatus.REFUNDED;
    item.cancelledAt = new Date();
    //item.refundId = refund.id;
  }
  await this.orderItemRepo.save(itemsToCancel);

  // Update order status
  const allCancelled = order.items.every(
    (i) => i.status === OrderItemStatus.REFUNDED || i.status === OrderItemStatus.CANCELLED,
  );
  order.status = allCancelled ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_CANCELLED;
  await this.orderRepo.save(order);

  // Update payment status (optional)
  payment.status = allCancelled ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
  await this.paymentRepo.save(payment);

  return {
    success: true,
    refundedAmount: refundAmount,
  //  refundId: refund.id,
    orderStatus: order.status,
    message: allCancelled
      ? 'Full order refunded successfully.'
      : 'Selected items refunded successfully.',
  };
}

}

