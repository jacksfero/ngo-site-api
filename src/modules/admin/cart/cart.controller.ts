// cart-admin.controller.ts
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
import { CartPaginationDto } from './dto/cart-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { CartDto,CartItemListDto } from './dto/cart-item-list.dto';


@Controller()
 
export class CartAdminController {
  constructor(private readonly cartService: CartService) {}

  @Get()
 // @RequirePermissions('read_cart')
  async listAllCarts(
    @Query(new PaginationClinetPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    paginationDto: CartPaginationDto
  ): Promise<PaginationResponseDto<CartItemListDto>>  {
    return await this.cartService.findAllCartsForAdmin(paginationDto);
  }

  @Delete(':id')
  // @RequirePermissions('delete_cart')
  async deleteCart(@Param('id') id: string) {
    return await this.cartService.deleteCart(+id);
  }


}

