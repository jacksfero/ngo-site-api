// cart.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartPaginationDto } from './dto/cart-pagination.dto';
import { CartListDto } from './dto/cart-list.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class CartService {
   private readonly CACHE_NAMESPACE = 'cart_listing';
  constructor(
    @InjectRepository(Cart)
     private cartRepo: Repository<Cart>,

     private cacheService: CacheService,
  ) {}

 async findAllCartsForAdmin(
  paginationDto: CartPaginationDto,
): Promise<PaginationResponseDto<CartListDto>> {
  const { page, limit, search, status } = paginationDto;
 // const cacheKey = this.cacheService.generateKey(this.CACHE_NAMESPACE, { page, limit, search, status });
const cacheKey = this.cacheService.generateKey(
  this.CACHE_NAMESPACE,
  JSON.stringify({ page, limit, search }),
);
  // ✅ Check cache
  const cachedResult = await this.cacheService.get<PaginationResponseDto<CartListDto>>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const skip = (page - 1) * limit;

  const query = this.cartRepo
    .createQueryBuilder('cart')
    .leftJoinAndSelect('cart.user', 'user')
    .leftJoinAndSelect('cart.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
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

  // Check if results exist
  if (result.length === 0 && total === 0) {
    throw new NotFoundException('No carts found matching your criteria');
  }

  // Check if requested page exists
  const totalPages = Math.ceil(total / limit);
  if (page > totalPages && totalPages > 0) {
    throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
  }

  // ✅ Transform entities -> DTO
  const data = plainToInstance(CartListDto, result, {
    excludeExtraneousValues: true,
  });

  const response = new PaginationResponseDto(data, { total, page, limit });

  // ✅ Save to cache
  await this.cacheService.set(cacheKey, response, { ttl: 300 });

  return response;
}



  async deleteCart(id: number): Promise<{ message: string }> {
  const cart = await this.cartRepo.findOne({
    where: { id },
    relations: ['items'],
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  await this.cartRepo.remove(cart);

  return { message: `Cart #${id} deleted successfully` };
}

}

