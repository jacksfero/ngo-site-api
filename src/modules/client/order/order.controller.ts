import { Controller, Get,Req, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@Req() req) {
    return this.orderService.createFromCart(req.user.sub);
  }

  @Get()
  getOrders(@Req() req) {
    return this.orderService.findAll(req.user.sub);
  }

  @Get(':id')
  getOrder(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(req.user.sub, id);
  }

  // Admin only
  @Patch(':id/status')
  //@Roles('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
