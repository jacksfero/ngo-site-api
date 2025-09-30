// cart.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartPaginationDto } from './dto/cart-pagination.dto';
import { CartListDto } from './dto/cart-list.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
  ) {}

  async findAllCartsForAdmin ( paginationDto: CartPaginationDto,
    ): Promise<PaginationResponseDto<CartListDto>> {

       const { page , limit, search,status   } = paginationDto;
    const skip = (page - 1) * limit;
const query = this.cartRepo
    .createQueryBuilder('cart')
    .leftJoinAndSelect('cart.user', 'user')
    .leftJoinAndSelect('cart.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
    .orderBy('cart.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (search) {
    query.andWhere(
      '(user.email LIKE :search OR user.fullName LIKE :search OR product.name LIKE :search)',
      { search: `%${search}%` },
    );
  }

  const [result, total] = await query.getManyAndCount();

    // Check if results exist
       if (result.length === 0 && total === 0) {
        throw new NotFoundException('No Blog found matching your criteria');
      }
     // Check if requested page exists
     const totalPages = Math.ceil(total / limit);
     if (page > totalPages && totalPages > 0) {
       throw new BadRequestException(`Page ${page} does not exist. Total pages: ${totalPages}`);
     }
      const data = plainToInstance(CartListDto, result, {
        excludeExtraneousValues: true,
      });
    
      return new PaginationResponseDto(data, { total, page, limit  });

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

