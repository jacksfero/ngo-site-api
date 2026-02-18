import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository,Not } from 'typeorm';
 
import { Product } from 'src/shared/entities/product.entity';
import { ProductFilterDto } from './dto/product-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { ProductListItemDto } from './dto/product-list-item.dto';
import { Style } from 'src/shared/entities/style.entity';
import { MediumResponseDto,StyleContentDto, StyleResponseDto,SubjectContentDto,SubjectResponseDto,SurfaceResponseDto } from './dto/style-response.dto';
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { ProductcategoryResponseDto } from 'src/modules/admin/productcategory/dto/pcate-res.dto';
import { CacheService } from 'src/core/cache/cache.service';
 
@Injectable()
export class ProductsService {
  constructor(
      private cacheService: CacheService,
    
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
     const cacheKey = `frontend:Artwork:prod:all:${JSON.stringify(paginationDto)}`;
     const cached = await this.cacheService.get(cacheKey);
         if (cached) {
           return cached as PaginationResponseDto<ProductListItemDto>;
         }
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

   // return new PaginationResponseDto(data, { total, page, limit });
      const response = new PaginationResponseDto(data, { total, page, limit });
    await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
    return response;
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

     const cacheKey = 'frontend:category:active';
      const cached = await this.cacheService.get<ProductcategoryResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const prodcat = await this.prodCatRepo.find({
      order: { id: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    const response = plainToInstance(ProductcategoryResponseDto, prodcat, {
      excludeExtraneousValues: true,
    });
    // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));

  return response;
  }


  async getActiveStyleList():  Promise<StyleResponseDto[]> {
    const cacheKey = 'frontend:style:active';
      const cached = await this.cacheService.get<StyleResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const style = await this.styleRepo.find({
      order: { title: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
    const response = plainToInstance(StyleResponseDto, style, {
      excludeExtraneousValues: true,
    });
     // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }

  async getActiveProdSurfaceList(slug: string):  Promise<SurfaceResponseDto[]>  {

    const cacheKey = `frontend:surface:active:${slug}`;
      const cached = await this.cacheService.get<SurfaceResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }

    const surfaces =  await this.surfaceRepo
      .createQueryBuilder('surface')
     // .leftJoin('surface.product', 'product')
      .leftJoin(Product, 'product', 'surface.id = product.surface_id')
       .leftJoin('product.productInventory', 'inventoryProduct')
       .leftJoin('product.category', 'category')
      .where('surface.status = :status', { status: true })
      .andWhere('surface.id != :id', { id: 22 })
      .andWhere('product.is_active = :active', { active: true })
     // .andWhere('category.slug = :slug', { slug })
      .andWhere(slug !== 'all' ? 'category.slug = :slug' : '1=1', { slug })
      .andWhere('inventoryProduct.status = :active', { active: true })
      .orderBy('surface.surfaceName', 'ASC')
      .getMany();
  
    const response =  plainToInstance(SurfaceResponseDto, surfaces, {
       excludeExtraneousValues: true,
     });
       // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));

  return response;
  }

async getStyleContentBySlug(slug: number): Promise<StyleContentDto> {
  const cacheKey = `frontend:Style:content:${slug}`;
  const cached = await this.cacheService.get<StyleContentDto>(cacheKey);
  
  if (cached) return cached;

  const style = await this.styleRepo.findOne({
    // If 'slug' is a number, you are likely querying the primary key 'id'
    where: { id: slug, status: true }, 
    select: ['id', 'title', 'description'],
  });

  if (!style) {
    throw new NotFoundException(`Style with ID ${slug} not found`);
  }

  const response = plainToInstance(StyleContentDto, style, {
    excludeExtraneousValues: true,
  });

   
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response))); 
  
  return response;
}

async getSubjectContentBySlug(slug: number): Promise<SubjectContentDto> {
  const cacheKey = `frontend:Style:content:${slug}`;
  const cached = await this.cacheService.get<SubjectContentDto>(cacheKey);
  
  if (cached) return cached;

  const style = await this.subjectRepo.findOne({
    // If 'slug' is a number, you are likely querying the primary key 'id'
    where: { id: slug, status: true }, 
    select: ['id', 'subject', 'description'],
  });

  if (!style) {
    throw new NotFoundException(`Style with ID ${slug} not found`);
  }

  const response = plainToInstance(SubjectContentDto, style, {
    excludeExtraneousValues: true,
  });

   
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response))); 
  
  return response;
}

  async getActiveProdStyleList(slug: string): Promise<StyleResponseDto[]> {

    const cacheKey = `frontend:Style:active:${slug}`;
      const cached = await this.cacheService.get<StyleResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
   const styles = await this.styleRepo
    .createQueryBuilder('style' )
    .select([
      'style.id', 
      'style.title', 
      // 'style.description', 
     // 'style.slug' // Only select what's needed for filters
    ])
    .leftJoin('style.products', 'product')  
    .leftJoin('product.productInventory', 'inventory') 
    .leftJoin('product.category', 'category')
     .where('style.status = :styleStatus', { styleStatus: true })  
     .andWhere('product.is_active = :productStatus', { productStatus: true })  
     .andWhere('inventory.status = :inventoryStatus', { inventoryStatus: true })  
     //.andWhere('category.slug = :slug', { slug })
      .andWhere(slug !== 'all' ? 'category.slug = :slug' : '1=1', { slug })
    .getMany();
   
    const response =  plainToInstance(StyleResponseDto, styles, {
      excludeExtraneousValues: true,
    });
      // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }
  
   
  async getActiveProdSubjectList(slug: string):  Promise<SubjectResponseDto[]>  {
     const cacheKey = `frontend:Subject:active:${slug}`;
      const cached = await this.cacheService.get<SubjectResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }

    const surfaces =  await this.subjectRepo
      .createQueryBuilder('subject') 
      .select([
      'subject.id', 
      'subject.subject', 
      // 'style.description', 
     
    ])    
      .leftJoin('subject.products', 'product')  
       .leftJoin('product.productInventory', 'inventoryProduct')
       .leftJoin('product.category', 'category')
      .where('subject.status = :status', { status: true })
      .andWhere('product.is_active = :active', { active: true })
     // .andWhere('category.slug = :slug', {  slug })
      .andWhere(slug !== 'all' ? 'category.slug = :slug' : '1=1', { slug })
      .andWhere('inventoryProduct.status = :active', { active: true })
      .orderBy('subject.subject', 'ASC')
      .getMany();
  
    const response = plainToInstance(SubjectResponseDto, surfaces, {
       excludeExtraneousValues: true,
     });
      await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }
  async getActiveSurfaceList():  Promise<SurfaceResponseDto[]> {
    const cacheKey = 'frontend:SurfaceRe:active';
      const cached = await this.cacheService.get<SurfaceResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const style = await this.surfaceRepo.find({
      order: { surfaceName: 'ASC' },
      where: {
       status: true, // only active surfaces
     //  id: Not(11),
     }
    });
    const response =  plainToInstance(SurfaceResponseDto, style, {
      excludeExtraneousValues: true,
    });
    await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }

  async getActiveProdMediumList(slug: string):  Promise<MediumResponseDto[]> {
     const cacheKey = `frontend:Medium:active:${slug}`;
      const cached = await this.cacheService.get<MediumResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const surfaces =  await this.mediumRepo
    .createQueryBuilder('medium')
   // .leftJoin('surface.product', 'product')
    .leftJoin(Product, 'product', 'medium.id = product.medium_id')
     .leftJoin('product.productInventory', 'inventoryProduct')
     .leftJoin('product.category', 'category')
    .where('medium.status = :status', { status: true })
    .andWhere('product.is_active = :active', { active: true })
   // .andWhere('category.slug = :slug', { slug })
    .andWhere(slug !== 'all' ? 'category.slug = :slug' : '1=1', { slug })
    .andWhere('inventoryProduct.status = :active', { active: true })
    .orderBy('medium.name', 'ASC')
    .getMany();
   const response =  plainToInstance(MediumResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
     await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }

  async getActiveMediumList():  Promise<MediumResponseDto[]> {
    const cacheKey = 'frontend:MediumRes:active';
      const cached = await this.cacheService.get<MediumResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const style = await this.mediumRepo.find({
      order: { name: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
     const response =  plainToInstance(MediumResponseDto, style, {
      excludeExtraneousValues: true,
    });
    await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
  }
  async getActiveSubjectList():  Promise<SubjectResponseDto[]> {
    const cacheKey = 'frontend:SubjectResp:active';
      const cached = await this.cacheService.get<SubjectResponseDto[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
    const style = await this.subjectRepo.find({
      order: { subject: 'ASC' },
      where: {
       status: true, // only active surfaces
     }
    });
     const response =  plainToInstance(SubjectResponseDto, style, {
      excludeExtraneousValues: true,
    });
await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)), { ttl: 3600 });

  return response;
      
  }

  
}
