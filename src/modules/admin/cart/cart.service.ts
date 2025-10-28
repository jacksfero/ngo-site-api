// cart.service.ts
import { BadRequestException,Logger, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,In } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartPaginationDto } from './dto/cart-pagination.dto';
import { CartItemListDto,CartDto } from './dto/cart-item-list.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { CacheService } from 'src/core/cache/cache.service';
import { CartItem } from 'src/shared/entities/cart-item.entity';

@Injectable()
export class CartService {
   private readonly CACHE_NAMESPACE = 'cart_listing';
  constructor(
    @InjectRepository(Cart)
     private cartRepo: Repository<Cart>,

      @InjectRepository(CartItem)
     private cartItemRepo: Repository<CartItem>,

     private cacheService: CacheService,
  ) {}

 async findAllCartsForAdmin(
  paginationDto: CartPaginationDto,
): Promise<PaginationResponseDto<CartDto>> {
  const { page, limit, search, status } = paginationDto;

  const cacheKey = this.cacheService.generateKey(
    this.CACHE_NAMESPACE,
    JSON.stringify({ page, limit, search, status }),
  );

  const cached = await this.cacheService.get<PaginationResponseDto<CartDto>>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  const query = this.cartRepo
    .createQueryBuilder('cart')
    .leftJoinAndSelect('cart.user', 'user')
    // ✅ LEFT JOIN ensures carts without items are still returned
    .leftJoinAndSelect('cart.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
    .where('cart.isCheckedOut = :isCheckedOut', { isCheckedOut: false })
    .orderBy('cart.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  if (search) {
    query.andWhere(
      '(user.email LIKE :search OR user.fullName LIKE :search OR product.name LIKE :search)',
      { search: `%${search}%` },
    );
  }

  const [result, total] = await query.getManyAndCount();

  // ✅ No longer throw an error if no items exist
  // Admin might still want to see empty carts
  // if (!result.length) {
  //   throw new NotFoundException('No cart items found matching your criteria');
  // }

  const data = plainToInstance(CartDto, result, {
    excludeExtraneousValues: true,
  });

  const response = new PaginationResponseDto(data, { total, page, limit });

  await this.cacheService.set(cacheKey, response, { ttl: 300 });

  return response;
}




 async findAllCartsForAdmin_bk(
  paginationDto: CartPaginationDto,
): Promise<PaginationResponseDto<CartItemListDto>> {
  const { page, limit, search, status } = paginationDto;

  const cacheKey = this.cacheService.generateKey(
    this.CACHE_NAMESPACE,
    JSON.stringify({ page, limit, search, status }),
  );

  // ✅ Check cache
  const cached = await this.cacheService.get<PaginationResponseDto<CartItemListDto>>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  // 🔹 Query cart items instead of carts
  const query = this.cartItemRepo
    .createQueryBuilder('item')
    .leftJoinAndSelect('item.cart', 'cart')
    .leftJoinAndSelect('cart.user', 'user')
    .leftJoinAndSelect('item.product', 'product')
    .where('cart.isCheckedOut = :isCheckedOut', { isCheckedOut:false })
     
    .orderBy('cart.createdAt', 'DESC')
    .skip(skip)
    .take(limit);
  console.log('Generated SQL Query:', query.getSql());
  if (search) {
    query.andWhere(
      '(user.email LIKE :search OR user.fullName LIKE :search OR product.name LIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (status !== undefined) {
    query.andWhere('cart.status = :status', { status });
  }

  const [result, total] = await query.getManyAndCount();

  if (!result.length) {
    throw new NotFoundException('No cart items found matching your criteria');
  }

  const totalPages = Math.ceil(total / limit);
  if (page > totalPages && totalPages > 0) {
    throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
  }

  // 🔹 Map to item-level DTO
  const data = plainToInstance(CartItemListDto, result, {
    excludeExtraneousValues: true,
  });

  const response = new PaginationResponseDto(data, { total, page, limit });

  await this.cacheService.set(cacheKey, response, { ttl: 300 });

  return response;
}
 
  async deleteCart(id: number): Promise<{ message: string }> {
  const cart = await this.cartRepo.findOne({
    where: { id },
    //relations: ['items'],
  });

  if (!cart) {
    throw new Error('Cart Item not found');
  }
  
try {
    await this.cartRepo.remove(cart);

    return { message: `Cart Item #${id} deleted successfully` };
  } catch (error) {
    throw new BadRequestException('Error deleting Cart');
  }

}


async cleanupEmptyCarts(): Promise<{ deleted: number }> {
  const emptyCarts = await this.cartRepo
    .createQueryBuilder('cart')
    .leftJoin('cart.items', 'items')
    .where('cart.isCheckedOut = :isCheckedOut', { isCheckedOut: false })
    .andWhere('items.id IS NULL')  // No items
    .getMany();

  const cartIds = emptyCarts.map(cart => cart.id);
  
  if (cartIds.length > 0) {
    await this.cartRepo.delete(cartIds);
  }
  
  return { deleted: cartIds.length };
}

// 🔥 MOST IMPORTANT: Cleanup abandoned carts
//@Cron('0 3 * * *') // Run daily at 3 AM
async cleanupAbandonedCarts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const abandonedCarts = await this.cartRepo
    .createQueryBuilder('cart')
    .leftJoin('cart.items', 'items')
    .where('cart.updatedAt < :date', { date: thirtyDaysAgo })
    .andWhere('cart.isCheckedOut = :checkedOut', { checkedOut: false })
    .getMany();
  
  for (const cart of abandonedCarts) {
    await this.cartItemRepo.delete({ cart: { id: cart.id } });
    await this.cartRepo.remove(cart);
  }
  
  //this.logger.log(`Cleaned up ${abandonedCarts.length} abandoned carts`);
}


 


// Guest cart expiration (7 days typical)
//@Cron('0 2 * * *') // Daily at 2 AM
async cleanupExpiredGuestCarts() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const expiredGuestCarts = await this.cartRepo
    .createQueryBuilder('cart')
    .where('cart.user IS NULL') // Guest carts
    .andWhere('cart.createdAt < :date', { date: sevenDaysAgo })
    .andWhere('cart.isCheckedOut = :checkedOut', { checkedOut: false })
    .getMany();
  
  const cartIds = expiredGuestCarts.map(cart => cart.id);
  
  if (cartIds.length > 0) {
    await this.cartItemRepo.delete({ cart: { id: In(cartIds) } });
    await this.cartRepo.delete(cartIds);
  }
}







}

