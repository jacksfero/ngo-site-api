import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'src/shared/entities/product.entity';
import { ProductFilterDto } from './dto/product-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { ProductListItemDto } from './dto/product-list-item.dto';


@Injectable()
export class ProductsService {


  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) { }
  async findAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<ProductListItemDto>> {
    const { page = 1, limit = 20, search } = paginationDto;

    const query = this.productRepo.createQueryBuilder('product')
     //  .leftJoinAndSelect('product.owner', 'user') // Join relation
      // .leftJoinAndSelect('product.artist', 'user') // Join relation
        .leftJoin('product.owner', 'owner')
    .leftJoin('product.artist', 'artist')
      .leftJoinAndSelect('product.images', 'images')
      .select([
        'product.id',
        'product.productTitle',
        'product.artist_price',
        'product.defaultImage',
         'owner.id',
      'owner.username',
      'artist.id',
      'artist.username',
        'product.createdAt',
        'images.id',           // ✅ include image ID
       'images.imagePath',    // ✅ include image path
      ])

      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.where('product.productTitle LIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await query.getManyAndCount();

    const data = plainToInstance(ProductListItemDto, items);

    return new PaginationResponseDto(data, { total, page, limit });
  }
  async findAllssssss(paginationDto: PaginationDto): Promise<PaginationResponseDto<Product>> {
    const { page = 1, limit = 10, search } = paginationDto;

    const query = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      // .leftJoinAndSelect('product.owner', 'owner')
      //  .leftJoinAndSelect('product.artist', 'artist')
      // .leftJoinAndSelect('product.wishlists', 'wishlists')
      .leftJoinAndSelect('product.displayMappings', 'displayMappings')
      // .leftJoinAndSelect('product.contact', 'contact')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.where('product.productTitle LIKE :search OR product.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [products, total] = await query.getManyAndCount();

    return new PaginationResponseDto(products, { total, page, limit });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['images', 'artist', 'owner'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /*
    create(createProductDto: CreateProductDto) {
      return 'This action adds a new product';
    }
  
    findAll() {
      return `This action returns all products`;
    }
  
    findOne(id: number) {
      return `This action returns a #${id} product`;
    }
  
    update(id: number, updateProductDto: UpdateProductDto) {
      return `This action updates a #${id} product`;
    }
  
    remove(id: number) {
      return `This action removes a #${id} product`;
    }*/
}
