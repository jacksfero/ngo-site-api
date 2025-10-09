import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PriceOnDemand, Product, ProductStatus } from '../../../shared/entities/product.entity';
import { ProductImage } from '../../../shared/entities/product-image.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
 import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from './dto/product.dto';
import { CacheService } from 'src/core/cache/cache.service';
import { plainToInstance } from 'class-transformer';
import { S3Service } from 'src/shared/s3/s3.service';
import { ProductPaginationDto, ProductSearchStatus } from './dto/product-pagination.dto';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
import { ProductListDto } from './dto/product-list.dto';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { PackingModeEntity } from 'src/shared/entities/packing-mode.entity';
import { CommissionType } from 'src/shared/entities/commission-type.entity';
import { ShippingTime } from 'src/shared/entities/shipping-time.entity';
import { Size } from 'src/shared/entities/size.entity';
import { User } from 'src/shared/entities/user.entity';
import { slugify } from 'src/shared/utils/slugify';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Orientation } from 'src/shared/entities/orientation.entity';
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Tag } from 'src/shared/entities/tag.entity';

@Injectable()
export class ProductService {
  constructor(
     private cacheService: CacheService,

    private readonly s3service: S3Service,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Style)
    private styleRepo: Repository<Style>,

     @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,

    @InjectRepository(Medium)
    private mediumRepo: Repository<Medium>,

    @InjectRepository(Surface)
    private surfaceRepo: Repository<Surface>,


    @InjectRepository(Productcategory)
    private ProdCatRepo: Repository<Productcategory>,

    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,
  ) { }


  async getProductList(): Promise<ProductListDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.productInventory', 'inventory')
     // .where('product.status = :status', { status: true })
      .where('product.is_active = :is_active', { is_active:'Active' })
      .andWhere('inventory.id IS NULL')
      .select(['product.id', 'product.productTitle'])
      .orderBy('product.productTitle', 'ASC')
      .getMany();

    const formatted = products.map((p) => ({
      id: p.id,
      productTitle: `${p.productTitle} (IG${p.id})`,
    }));

    return plainToInstance(ProductListDto, formatted, {
      excludeExtraneousValues: true,
    });
  }
   

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (await this.productRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }

  async create(dto: CreateProductDto, user: any, imageFilename?: Express.Multer.File): Promise<Product> {
    
    let titleImage: string | null = null;
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      titleImage =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }
 
    const product = this.productRepository.create({
      ...dto,
      defaultImage: titleImage,
      slug: await this.generateUniqueSlug(dto.slug),
      category: { id: dto.category_id } as Productcategory,
      artist: { id: dto.artist_id } as User,
      owner: { id: dto.owner_id } as User,
      createdBy: user.sub.toString(),
      is_active:  dto.is_active as ProductStatus,
       price_on_demand:  dto.price_on_demand as PriceOnDemand,
     // surface: { id: dto.surface_id } as Surface,
   //   medium: { id: dto.medium_id } as Medium,
 

       ...(dto.surface_id && { surface: { id: dto.surface_id } as Surface }),
       ...(dto.medium_id && { medium: { id: dto.medium_id } as Medium }),
    }); 
    if (dto.subjectsIds?.length) {
      product.subjects = await this.subjectRepo.findBy({ id: In(dto.subjectsIds) });
    }
    if (dto.stylesIds?.length) {
      product.styles = await this.styleRepo.findBy({ id: In(dto.stylesIds) });
    }

      if (dto.tagIds?.length) {
      product.tags = await this.tagRepo.findBy({ id: In(dto.tagIds) });
    }
     

  //  return this.productRepository.save(product);
    const productss = await this.productRepository.save(product);

     await this.cacheService.deletePattern('Admin:Artwork:*');

  return productss;
  }
 
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: any,
    newImageFile?: Express.Multer.File | null,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Product not found');
    // console.log('product-before--',product.packingModeId)
    //Object.assign(product, updateProductDto);
    // console.log('product--after-',product.packingModeId); 
     
   // process.exit;
    if (newImageFile) {
      const cleanName = sanitizeFileName(newImageFile.originalname);
      const key = `products/${Date.now()}-${cleanName}`;

      // Upload image to S3 (returns the file URL or key)
      const uploadedUrl = await this.s3service.uploadBuffer(
        key,
        newImageFile.buffer,
        newImageFile.mimetype, // make sure content-type is set!
      );
      // Delete old image if exists
      if (product.defaultImage) {
        await this.s3service.deleteObject(product.defaultImage);
      }
      // Save new URL/key in DB
      product.defaultImage = uploadedUrl;
    }
    // tags
  if (updateProductDto.tagIds !== undefined) {
    product.tags =
      updateProductDto.tagIds.length > 0
        ? await this.tagRepo.findBy({ id: In(updateProductDto.tagIds) })
        : [];
  }
   // subjects
  if (updateProductDto.subjectsIds !== undefined) {
    product.subjects =
      updateProductDto.subjectsIds.length > 0
        ? await this.subjectRepo.findBy({ id: In(updateProductDto.subjectsIds) })
        : [];
  }
  // styles
  if (updateProductDto.stylesIds !== undefined) {
    product.styles =
      updateProductDto.stylesIds.length > 0
        ? await this.styleRepo.findBy({ id: In(updateProductDto.stylesIds) })
        : [];
  }
  if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
    product.slug = await this.generateUniqueSlug(updateProductDto.slug);   
  }
  //if (updateProductDto.status !== undefined) {  
    product.is_active =  updateProductDto.is_active as ProductStatus;
     product.price_on_demand =  updateProductDto.price_on_demand as PriceOnDemand;
 // }
    product.updatedBy = user.sub.toString();

    product.alt_text = updateProductDto.alt_text ?? null;


    if (updateProductDto.productTitle !== undefined) {
      product.productTitle = updateProductDto.productTitle;
    }if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }if (updateProductDto.width !== undefined) {
      product.width = updateProductDto.width;
    }if (updateProductDto.height !== undefined) {
      product.height = updateProductDto.height;
    }if (updateProductDto.depth !== undefined) {
      product.depth = updateProductDto.depth;
    }if (updateProductDto.weight !== undefined) {
      product.weight = updateProductDto.weight;
    }if (updateProductDto.created_in !== undefined) {
      product.created_in = updateProductDto.created_in;
    }
    if (updateProductDto.remark_to_indigalleria !== undefined) {
      product.remark_to_indigalleria = updateProductDto.remark_to_indigalleria;
    }
    if (updateProductDto.remark_to_artist !== undefined) {
      product.remark_to_artist = updateProductDto.remark_to_artist;
    }
    if (updateProductDto.artist_price !== undefined) {
      product.artist_price = updateProductDto.artist_price;
    }
    product.category = { id: updateProductDto.category_id } as Productcategory;
    product.packingMode = { id: updateProductDto.packingModeId } as PackingModeEntity;
    product.commissionType = { id: updateProductDto.commissionTypeId } as CommissionType;
    product.shippingTime = { id: updateProductDto.shippingTimeId } as ShippingTime;
    product.size = { id: updateProductDto.size_id } as Size;
    product.artist = { id: updateProductDto.artist_id } as User;
    product.owner = { id: updateProductDto.owner_id } as User;
    product.orientation = { id: updateProductDto.orientation_id } as Orientation;
   // product.surface = {id: updateProductDto.surface_id } as Surface  ;
   // product.medium = { id: updateProductDto.medium_id } as Medium   ;
    
// Surface
if (updateProductDto.surface_id !== undefined) {
  if (updateProductDto.surface_id === null) {
    product.surface = null; // remove relation
  } else {
    const surface = await this.surfaceRepo.findOne({ where: { id: updateProductDto.surface_id } });
    if (!surface) {
      throw new BadRequestException(`Surface ${updateProductDto.surface_id} not found`);
    }
    product.surface = surface;
  }
}

// Medium
if (updateProductDto.medium_id !== undefined) {
  if (updateProductDto.medium_id === null) {
    product.medium = null;
  } else {
    const medium = await this.mediumRepo.findOne({ where: { id: updateProductDto.medium_id } });
    if (!medium) {
      throw new BadRequestException(`Medium ${updateProductDto.medium_id} not found`);
    }
    product.medium = medium;
  }
}

      // 🔹 Multiple boolean fields update
  const booleanFields: (keyof UpdateProductDto)[] = [
    'is_lock','original_painting','new_arrival','eliteChoice','affordable_art',
    'negotiable','printing_rights','featured','refundable'
    ,'certificate','is_lock' ,'terms_and_conditions'    
  ];
  for (const field of booleanFields) {
    if (updateProductDto[field] !== undefined) {
     // (product as any)[field] = Boolean(updateProductDto[field]);
       (product as any)[field] = this.convertToBoolean(updateProductDto[field]);
    }
  }

     const productss = await this.productRepository.save(product);

     await this.cacheService.deletePattern('Admin:Artwork:*');

  return productss;
  }


  private convertToBoolean(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    return Boolean(value);
  }
 
  async paginate(
    paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    const { page, limit,is_active, search,artistId,status,   categoryId } = paginationDto;
    const skip = (page - 1) * limit;


     const cacheKey = `Admin:Artwork:${JSON.stringify(paginationDto)}`;
const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as PaginationResponseDto<ProductDto>;
    }
    const queryBuilder = this.productRepository.createQueryBuilder('product')
                         .leftJoinAndSelect('product.artist', 'artist')
                         .leftJoinAndSelect('product.owner', 'owner')
                         .leftJoinAndSelect('product.category', 'category');
    if (search) {
       
        queryBuilder.andWhere(
          `(LOWER(product.productTitle) LIKE :search 
        OR LOWER(product.id) LIKE :search
        OR LOWER(artist.username) LIKE :search
        OR LOWER(owner.username) LIKE :search)`,
          { search: `%${search.toLowerCase()}%` },
        );
       
    }
    if (artistId) { 
      queryBuilder.andWhere('product.artist_id LIKE :artistId', { artistId  });
    }
    if (categoryId) {
     // console.log(categoryId,'----cateid----------')
      queryBuilder.andWhere('product.category_id LIKE :categoryId', { categoryId   });
    }
 
    if (status) {
      const fieldMap: Record<ProductSearchStatus, string> = {
        [ProductSearchStatus.NEW_ARRIVAL]: 'product.new_arrival',
        [ProductSearchStatus.ELITE_CHOICE]: 'product.eliteChoice',
        [ProductSearchStatus.FEATURED]: 'product.featured',
        [ProductSearchStatus.IS_LOCK]: 'product.is_lock',
        [ProductSearchStatus.NEGOTIABLE]: 'product.negotiable',
        [ProductSearchStatus.PRICE_ON_DEMAND]: 'product.price_on_demand',
        [ProductSearchStatus.AFFORDABLE_ART]: 'product.affordable_art',
      };
    
      queryBuilder.andWhere(`${fieldMap[status]} = :flag`, { flag: true });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('product.is_active = :is_active', { is_active });
    }
    
    const [products, total] = await queryBuilder
    .orderBy('product.id', 'DESC')
    .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = plainToInstance(ProductDto, products, {
      excludeExtraneousValues: true,
    });

   const response = new PaginationResponseDto(data, { total, page, limit });
    await this.cacheService.set(cacheKey, response);
    return response;
  }
  async findOne(id: number): Promise<Product> {

      const cacheKey = `Admin:Artwork:${id}`;
        const cached = await this.cacheService.get<Product>(cacheKey);
        if (cached) return cached;

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['owner','category','artist','subjects','styles',
      'images', 'packingMode', 'commissionType', 'shippingTime', 'size',
       'medium', 'surface','tags' ,'orientation' ,
    ],
    });
   // console.log('----------',product);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
     await this.cacheService.set(cacheKey, product);
    
    return product;

  }

  async toggleStatus(id: number, user: any): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`product with ID ${id} not found`);
    }
   // product.status = !product.status;
    product.updatedBy = user.sub.toString(); // or user.sub.toString()
     await this.cacheService.deletePattern('Admin:Artwork:*');
    return this.productRepository.save(product);

  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async addImage(productId: number, file: Express.Multer.File,alt_text?:string|null) {
    let imageurl;
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (file) {
      console.log(`file.originalname --------- `,file.originalname)
      console.log(`file.originalname --------- `,file.buffer)
      console.log(`file.originalname --------- `,file.mimetype)
      console.log(`allt taxt 1 --------- `,alt_text)
      const cleanName = sanitizeFileName(file.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      try {
        imageurl = await this.s3service.uploadBuffer(
          key,
          file.buffer,
          file.mimetype
        );
      } catch (error) {
        throw new BadRequestException('Image upload failed');
      }
    }
    console.log(`allt taxt --------- `,alt_text)
    const image = this.imageRepo.create({
      //imagePath: `/product-images/${fileName}`, // just the relative path 
      imagePath: imageurl, // just the relative path
      alt_text:alt_text ?? null,
      product,
    });
 await this.cacheService.deletePattern('Admin:Artwork:*');
    return this.imageRepo.save(image);
  }
  async updateImageAltText(imageId: number, altText: string) {
    const image = await this.imageRepo.findOne({ where: { id: imageId } });
  
    if (!image) {
      throw new NotFoundException('Image not found');
    }
  
    image.alt_text = altText;
    await this.imageRepo.save(image);
   await this.cacheService.deletePattern('Admin:Artwork:*');
    return {
      message: 'Alt text updated successfully',
      image,
    };
  }

  async deleteImage(imageId: number) {
    const image = await this.imageRepo.findOne({ where: { id: imageId }, relations: ['product'] });
    if (!image) throw new NotFoundException('Image not found');

    // const fullPath = path.join(process.cwd(), 'uploads/product-images', path.basename(image.imagePath));
    // if (fs.existsSync(fullPath)) {
    //   fs.unlinkSync(fullPath);
    // }
    // Delete old image if exists
    if (image.imagePath) {
      // const oldKey = this.extractS3Key(blog.titleImage);
      await this.s3service.deleteObject(image.imagePath);
    }
 await this.cacheService.deletePattern('Admin:Artwork:*');
    return this.imageRepo.remove(image);
  }

  
}
