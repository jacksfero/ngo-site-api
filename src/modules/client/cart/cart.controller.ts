import { Controller, Get, Post, Body, Req, Res, UseGuards, HttpException, HttpStatus, ParseIntPipe, Param, Delete, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Public } from 'src/core/decorators/public.decorator';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt-auth.guard';
 

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

      if (!userId && !guestId) {
        guestId = uuidv4();
        this.setGuestCookie(res, guestId);
      }

      return await  this.cartService.getOrCreateCart(userId, guestId);
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

  private setGuestCookie(res: Response, guestId: string): void {
    res.cookie('guestCartId', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
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

