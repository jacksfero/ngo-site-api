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
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { ProductcategoryResponseDto } from 'src/modules/admin/productcategory/dto/pcate-res.dto';

 
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

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Productcategory)
    private readonly prodCatRepo: Repository<Productcategory>,

  ) {}
  async findAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<ProductListItemDto>> {
    const { page = 1, limit = 20, search } = paginationDto;

    const query = this.inventoryRepo.createQueryBuilder('inventory')
       .leftJoinAndSelect('inventory.product', 'product') // Join relation      
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
  async findAll_bk(paginationDto: PaginationDto): Promise<PaginationResponseDto<ProductListItemDto>> {
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


  async getActiveCategoryList():  Promise<ProductcategoryResponseDto[]> {
    const prodcat = await this.prodCatRepo.find({
      order: { name: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    return plainToInstance(ProductcategoryResponseDto, prodcat, {
      excludeExtraneousValues: true,
    });
  }


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

  async getActiveProdSurfaceList(slug: string):  Promise<SurfaceResponseDto[]>  {
    const surfaces =  await this.surfaceRepo
      .createQueryBuilder('surface')
     // .leftJoin('surface.product', 'product')
      .leftJoin(Product, 'product', 'surface.id = product.surface_id')
       .leftJoin('product.productInventory', 'inventoryProduct')
       .leftJoin('product.category', 'category')
      .where('surface.status = :status', { status: true })
      .andWhere('product.status = :active', { active: true })
      .andWhere('category.slug = :slug', { slug })
      .andWhere('inventoryProduct.status = :active', { active: true })
      .orderBy('surface.surfaceName', 'ASC')
      .getMany();
  
     return plainToInstance(SurfaceResponseDto, surfaces, {
       excludeExtraneousValues: true,
     });
  }
  async getActiveProdStyleList(slug: string): Promise<StyleResponseDto[]> {
   const styles = await this.styleRepo
    .createQueryBuilder('style' )
    .leftJoin('style.products', 'product')  
    .leftJoin('product.productInventory', 'inventory') 
    .leftJoin('product.category', 'category')
     .where('style.status = :styleStatus', { styleStatus: true })  
     .andWhere('product.status = :productStatus', { productStatus: true })  
     .andWhere('inventory.status = :inventoryStatus', { inventoryStatus: true })  
     .andWhere('category.slug = :slug', { slug })
    .getMany();
  /*/
  const styles = await this.styleRepo.find({
    where: { 
      status: true 
    },
    relations: ['products'], // Let TypeORM handle the join
    order: { 
      title: 'ASC' 
    }
  });*/
    return plainToInstance(StyleResponseDto, styles, {
      excludeExtraneousValues: true,
    });
  }
  
   
  async getActiveProdSubjectList(slug: string):  Promise<SubjectResponseDto[]>  {
    const surfaces =  await this.subjectRepo
      .createQueryBuilder('subject')     
      .leftJoin('subject.products', 'product')  
       .leftJoin('product.productInventory', 'inventoryProduct')
       .leftJoin('product.category', 'category')
      .where('subject.status = :status', { status: true })
      .andWhere('product.status = :active', { active: true })
      .andWhere('category.slug = :slug', {  slug })
      .andWhere('inventoryProduct.status = :active', { active: true })
      .orderBy('subject.subject', 'ASC')
      .getMany();
  
     return plainToInstance(SubjectResponseDto, surfaces, {
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

  async getActiveProdMediumList(slug: string):  Promise<MediumResponseDto[]> {
    const surfaces =  await this.mediumRepo
    .createQueryBuilder('medium')
   // .leftJoin('surface.product', 'product')
    .leftJoin(Product, 'product', 'medium.id = product.medium_id')
     .leftJoin('product.productInventory', 'inventoryProduct')
     .leftJoin('product.category', 'category')
    .where('medium.status = :status', { status: true })
    .andWhere('product.status = :active', { active: true })
    .andWhere('category.slug = :slug', { slug })
    .andWhere('inventoryProduct.status = :active', { active: true })
    .orderBy('medium.name', 'ASC')
    .getMany();
    return plainToInstance(MediumResponseDto, surfaces, {
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
