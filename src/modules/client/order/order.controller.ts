import { Controller, Get, Req, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Order } from 'src/shared/entities/order.entity';

@Controller()
@UseGuards(JwtAuthGuard) // ✅ Checkout requires authentication
export class OrderController {
  constructor(private readonly orderService: OrderService,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) { }


  @Post('checkout')
  async checkout(
    @Req() req,
    @Body('shippingAddressId') shippingAddressId?: number,
    @Body('billingAddressId') billingAddressId?: number
  ) {
    try {
      const userId = req.user.sub.toString();
      return await this.orderService.createFromCart(userId, shippingAddressId, billingAddressId);
    } catch (error) {
      throw new HttpException(
        `Checkout failed: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }


  @Get()
  async getOrders(@Req() req) {
    try {
      const userId = req.user.sub.toString();
      return await this.orderService.findAll(userId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch orders: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getOrder(@Req() req, @Param('id', ParseIntPipe) id: number) {
    try {
      const userId = req.user.sub.toString();
      return await this.orderService.findOne(userId, id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch order: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  // Admin only
  @Patch(':id/status')
  //@Roles('admin') // Uncomment when you have role-based auth
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    try {
      return await this.orderService.updateStatus(id, dto);
    } catch (error) {
      throw new HttpException(
        `Failed to update order status: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }


  @Post(':orderId/cancel-items')
  async cancelItems(
    @Param('orderId') orderId: number,
    @Body('itemIds') itemIds: number[],
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.orderService.cancelOrderItems(orderId, itemIds, userId);
  }
  @Post(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: number,
    @Req() req: any
  ) {
    const userId = req.user?.sub;

    // 1️⃣ Fetch the order with all items
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // 2️⃣ Extract all item IDs
    const itemIds = order.items.map((i) => i.id);

    // 3️⃣ Reuse existing partial cancel service
    return this.orderService.cancelOrderItems(orderId, itemIds, userId);
  }



}
