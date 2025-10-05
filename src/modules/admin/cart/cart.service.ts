// cart.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartPaginationDto } from './dto/cart-pagination.dto';
import { CartItemListDto } from './dto/cart-item-list.dto';
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
    .orderBy('cart.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

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
  const cart = await this.cartItemRepo.findOne({
    where: { id },
    //relations: ['items'],
  });

  if (!cart) {
    throw new Error('Cart Item not found');
  }

  await this.cartItemRepo.remove(cart);

  return { message: `Cart Item #${id} deleted successfully` };
}

}

