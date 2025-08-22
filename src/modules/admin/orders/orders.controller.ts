import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { ORDER_LIMIT,ORDER_MAX_LIMIT,ORDER_PAGE } from 'src/shared/config/pagination.config';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query(new PaginationPipe(ORDER_LIMIT, ORDER_MAX_LIMIT, ORDER_PAGE))
    @Query() paginationDto: OrderPaginationDto,
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    return this.ordersService.findAll(paginationDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.delete(+id);
  }
}
