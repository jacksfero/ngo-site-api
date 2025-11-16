import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { ORDER_LIMIT,ORDER_MAX_LIMIT,ORDER_PAGE } from 'src/shared/config/pagination.config';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
   @RequirePermissions('read_order')
  async findAll(
    @Query(new PaginationClinetPipe(ORDER_LIMIT, ORDER_MAX_LIMIT, ORDER_PAGE))
    @Query() paginationDto: OrderPaginationDto,
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    return this.ordersService.findAll(paginationDto);
  }


  @Get(':id')
  @RequirePermissions('read_order')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id/status')
  @RequirePermissions('update_order')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_order')
  remove(@Param('id') id: string) {
    return this.ordersService.delete(+id);
  }
}
