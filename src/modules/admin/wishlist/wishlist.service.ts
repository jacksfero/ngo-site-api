import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from '../../../shared/entities/wishlist.entity';
import { Repository } from 'typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Product } from '../../../shared/entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // create(createWishlistDto: CreateWishlistDto) {}
  async addToWishlist(
    userId: number,
    dto: CreateWishlistDto,
  ): Promise<Wishlist> {
   
    const user = await this.userRepository.findOneBy({ id: userId });
    const product = await this.productRepository.findOneBy({
      id: dto.productId,
    });

      console.log(user,'---------userid-------');

    if (!user) throw new NotFoundException('User not found');
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.wishlistRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: product.id },
      },
    });

    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    const wishlist = this.wishlistRepository.create({ user, product });
    return this.wishlistRepository.save(wishlist);
  }

  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }



  findAll() {
    return `This action returns all wishlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wishlist`;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return `This action updates a #${id} wishlist`;
  }

 async remove(id: number) : Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
      if (!wishlist) throw new NotFoundException(`wishlist ${id} not found`);
    await this.wishlistRepository.remove(wishlist);
  }
}
