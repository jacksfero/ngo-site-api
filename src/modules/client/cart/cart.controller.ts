import { Controller, Get, Post, Body, Req, Res, UseGuards, HttpException, HttpStatus, ParseIntPipe, Param, Delete, Patch, ConsoleLogger } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Public } from 'src/core/decorators/public.decorator';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt-auth.guard';
import { CartItemListDto } from './dto/cat-item-list.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateCartCurrencyDto } from './dto/update-cart-currency.dto';
 

@Controller()
 
 //@UseGuards(LocalAuthGuard) // ✅ This is KEY
 //@UseGuards(JwtAuthGuard) // protect with auth
export class CartController {
  constructor(private readonly cartService: CartService) {}

 

  @UseGuards(OptionalJwtAuthGuard)
 @Get()
  async getCart(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userId =  req.user?.sub?.toString(); // Safe for guests // ✅ Use sub from JWT
      let guestId = req.cookies?.['guestCartId'];
      if(req.ip == '49.36.137.209'){
      console.log(`guestId--1---${guestId}------ip------${req.ip}--ip ---`);
}

      if (!userId && !guestId) {
        guestId = uuidv4();
        console.log(`guestId--2---${guestId}------userId------${userId}`);
        this.setGuestCookie(res, guestId);
      }

     // return await  this.cartService.getOrCreateCart(userId, guestId);
      const cart = await this.cartService.getOrCreateCart(userId, guestId);
      return plainToInstance(CartItemListDto, cart, { excludeExtraneousValues: true });
    } catch (error) {
      throw new HttpException(
        `Failed to get cart: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 
  @UseGuards(OptionalJwtAuthGuard)
  @Post('add')
  async addToCart(
    @Body() dto: AddToCartDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userId =  req.user?.sub?.toString(); // Safe for guests // ✅ Use sub from JWT
      let guestId = req.cookies?.['guestCartId'];

      // Validate request data
      if (!dto.productId || !dto.quantity) {
        throw new HttpException('Product ID and quantity are required', HttpStatus.BAD_REQUEST);
      }

      if (dto.quantity <= 0) {
        throw new HttpException('Quantity must be greater than 0', HttpStatus.BAD_REQUEST);
      }

      if (!userId && !guestId) {
        guestId = uuidv4();
        this.setGuestCookie(res, guestId);
      }

      const result = await this.cartService.addToCart(dto, userId, guestId);
      
      return {
        success: true,
        message: 'Product added to cart successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to add to cart: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('update')
  async updateItem(
    @Body() dto: UpdateCartItemDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userId = req.user?.sub?.toString(); // ✅ Safe for guests
      let guestId = req.cookies?.['guestCartId'];

      if (!userId && !guestId) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.cartService.updateItem(dto, userId, guestId);
      
      return {
        success: true,
        message: 'Cart item updated successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update cart item: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

 @UseGuards(OptionalJwtAuthGuard)
  @Patch(':id/currency')
  async updateCurrency(
    @Param('id') cartId: number,
    @Body() dto: UpdateCartCurrencyDto,
  ) {
    return this.cartService.updateCurrency(cartId, dto.currency);
  }

   @UseGuards(OptionalJwtAuthGuard)
  @Patch(':id/shipping')
async updateShipping(
  @Param('id') cartId: number,
  @Body() body: { country: string },
) {
  return this.cartService.updateShipping(cartId, body.country);
}


  @UseGuards(OptionalJwtAuthGuard)
  @Delete('remove/:id')
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userId = req.user?.sub?.toString(); // ✅ Safe for guests
      let guestId = req.cookies?.['guestCartId'];

      if (!userId && !guestId) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.cartService.removeItem(id, userId, guestId);
      
      return {
        success: true,
        message: 'Item removed from cart successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to remove item: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // ✅ PROTECTED: Only authenticated users can checkout
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Req() req) {
    try {
      const userId = req.user.sub.toString(); // ✅ Guaranteed to exist with guard
      const result = await this.cartService.checkout(userId);
      
      return {
        success: true,
        message: 'Checkout completed successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to checkout: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  } 
 
   // ✅ PROTECTED: Only authenticated users can merge carts
   @UseGuards(JwtAuthGuard)
   @Post('merge')
   async mergeCarts(
     @Req() req,
     @Res({ passthrough: true }) res: Response,
   ) {
     try {
       const userId = req.user.sub.toString(); // ✅ Guaranteed to exist with guard
       const guestId = req.cookies?.['guestCartId'];
 
       if (!guestId) {
         // No guest cart to merge, just return user cart
         const result = await this.cartService.getUserCart(userId);
         return {
           success: true,
           message: 'User cart retrieved',
           data: result,
         };
       }
 
       const result = await this.cartService.mergeCarts(userId, guestId);
       // Clear guest cookie after successful merge
       res.clearCookie('guestCartId');
       
       return {
         success: true,
         message: 'Carts merged successfully',
         data: result,
       };
     } catch (error) {
       throw new HttpException(
         `Failed to merge carts: ${error.message}`,
         HttpStatus.INTERNAL_SERVER_ERROR
       );
     }
   }

private setGuestCookie(res: Response, guestId: string) {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('guestCartId', guestId, {
    httpOnly: true,
    // ✅ Use 'none' for cross-domain (Prod), 'lax' for same-domain (Local)
    sameSite: isProd ? 'none' : 'lax', 
    // ✅ Secure MUST be true if sameSite is 'none'
    secure: isProd ? true : false, 
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // ✅ Don't set domain for localhost
    ...(isProd && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}
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

