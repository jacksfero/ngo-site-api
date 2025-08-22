import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,Patch,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // adjust path

@Controller()
//@UseGuards(JwtAuthGuard) // protect with auth
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getOrCreateCart(req.user.sub);
  }

 @Post('add')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, dto);
  }

  @Patch('update')
  updateItem(@Req() req, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.sub, dto);
  }

  @Delete('remove/:id')
  removeItem(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(req.user.sub, id);
  }
 
  @Post('checkout')
  checkout(@Req() req) {
    return this.cartService.checkout(req.user.sub);
  } 


 /*  @Put('update/:itemId')
  async updateCartItem(
    @Param('itemId') itemId: number,
    @Body() dto: UpdateCartItemDto,
    @Req() req,
  ) {
    return this.cartService.updateCartItem(req.user.sub, itemId, dto.quantity);
  }

  @Delete('remove/:itemId')
  async removeCartItem(@Param('itemId') itemId: number, @Req() req) {
    return this.cartService.removeCartItem(req.user.sub, itemId);
  }

 */

  /*@Post('checkout')
  async checkout(@Body() dto: CheckoutDto, @Req() req) {
    return this.cartService.checkout(req.user.sub, dto.addressId);
  }*/
}
