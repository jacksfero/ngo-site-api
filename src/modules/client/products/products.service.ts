import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
 
import { Product } from 'src/shared/entities/product.entity';
import { ProductFilterDto } from './dto/product-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { ProductListItemDto } from './dto/product-list-item.dto';
import { Style } from 'src/shared/entities/style.entity';
import { MediumResponseDto, StyleResponseDto,SubjectResponseDto,SurfaceResponseDto } from './dto/style-response.dto';
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Subject } from 'src/shared/entities/subject.entity';

 
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Style)
    private readonly styleRepo: Repository<Style>,

    @InjectRepository(Surface)
    private readonly surfaceRepo: Repository<Surface>,

    @InjectRepository(Medium)
    private readonly mediumRepo: Repository<Medium>,

    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

  ) {}

  async getActiveStyleList():  Promise<StyleResponseDto[]> {
    const style = await this.styleRepo.find({
      order: { title: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(StyleResponseDto, style, {
      excludeExtraneousValues: true,
    });
  }

  async getActiveSurfaceList():  Promise<SurfaceResponseDto[]> {
    const style = await this.surfaceRepo.find({
      order: { surfaceName: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(SurfaceResponseDto, style, {
      excludeExtraneousValues: true,
    });
  }

  async getActiveMediumList():  Promise<MediumResponseDto[]> {
    const style = await this.mediumRepo.find({
      order: { name: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(MediumResponseDto, style, {
      excludeExtraneousValues: true,
    });
  }
  async getActiveSubjectList():  Promise<SubjectResponseDto[]> {
    const style = await this.subjectRepo.find({
      order: { subject: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(SubjectResponseDto, style, {
      excludeExtraneousValues: true,
    });
  }

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
