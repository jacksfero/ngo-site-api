import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from '../../../shared/entities/product-image.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
 import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from './dto/product.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { S3Service } from 'src/shared/s3/s3.service';
import { ProductPaginationDto } from './dto/product-pagination.dto';
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

@Injectable()
export class ProductService {
  constructor(
    private readonly s3service: S3Service,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Style)
    private styleRepo: Repository<Style>,

    @InjectRepository(Productcategory)
    private ProdCatRepo: Repository<Productcategory>,

    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,
  ) { }


  async getProductList(): Promise<ProductListDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.productInventory', 'inventory')
      .where('product.status = :status', { status: true })
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
    let subjectss: any[] = [];
    let styless: any[] = [];
    let titleImage: string | null = null;
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      titleImage =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }

     // Check for existing blog
     const [existingByTitle, existingBySlug] = await Promise.all([
      this.productRepository.findOneBy({ productTitle: dto.productTitle }),
      dto.slug ? this.productRepository.findOneBy({ slug: dto.slug }) : null
  ]);
  
  if (existingByTitle) throw new ConflictException('Product title already exists');
  if (existingBySlug) throw new ConflictException('Product slug already exists');

    const product = this.productRepository.create({
      ...dto,
      defaultImage: titleImage,
      slug : await this.generateUniqueSlug(dto.slug),
      //  styles: styless,
      category: { id: dto.category_id } as Productcategory,
      artist: { id: dto.artist_id } as User,
      owner: { id: dto.owner_id } as User,
      createdBy: user.sub.toString(),
    });
    if (dto.subjectsIds?.length) {
      product.subjects = await this.subjectRepo.findBy({ id: In(dto.subjectsIds) });
    }
    if (dto.stylesIds?.length) {
      product.styles = await this.styleRepo.findBy({ id: In(dto.stylesIds) });
    }

    return this.productRepository.save(product);
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
  product.updatedBy = user.sub.toString();
    product.updatedBy = user.sub.toString();
    product.category = { id: updateProductDto.category_id } as Productcategory;
    product.packingMode = { id: updateProductDto.packingModeId } as PackingModeEntity;
    product.commissionType = { id: updateProductDto.commissionTypeId } as CommissionType;
    product.shippingTime = { id: updateProductDto.shippingTimeId } as ShippingTime;
    product.size = { id: updateProductDto.size_id } as Size;
    product.artist = { id: updateProductDto.artist_id } as User;
    product.owner = { id: updateProductDto.owner_id } as User;
  //   product.is_lock = updateProductDto.is_lock !== undefined 
  // ? Boolean(updateProductDto.is_lock) 
  // : product.is_lock; // keep existing value

      // 🔹 Multiple boolean fields update
  const booleanFields: (keyof UpdateProductDto)[] = [
    'is_lock','original_painting','new_arrival','eliteChoice','affordable_art',
    'price_on_demand','negotiable','printing_rights','featured','refundable'
    ,'certificate','is_lock'    
  ];
  for (const field of booleanFields) {
    if (updateProductDto[field] !== undefined) {
     // (product as any)[field] = Boolean(updateProductDto[field]);
       (product as any)[field] = this.convertToBoolean(updateProductDto[field]);
    }
  }

    return this.productRepository.save(product);
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
    const { page, limit, search,artistId, status,categoryId } = paginationDto;
    const skip = (page - 1) * limit;
   

    const queryBuilder = this.productRepository.createQueryBuilder('product')
                         .leftJoinAndSelect('product.artist', 'artist')
                         .leftJoinAndSelect('product.owner', 'owner')
                         .leftJoinAndSelect('product.category', 'category');
    if (search) {
      queryBuilder.andWhere('product.productTitle LIKE :search', { search: `%${search}%` });
    }
    if (artistId) { 
      queryBuilder.andWhere('product.artist_id LIKE :artistId', { artistId  });
    }
    if (categoryId) {
     // console.log(categoryId,'----cateid----------')
      queryBuilder.andWhere('product.category_id LIKE :categoryId', { categoryId   });
    }
 
    if (status !== undefined) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = plainToInstance(ProductDto, products, {
      excludeExtraneousValues: true,
    });

    return new PaginationResponseDto(data, { total, page, limit });

  }
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['owner','category','artist','subjects','styles'],
    });
   // console.log('----------',product);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async toggleStatus(id: number, user: any): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`product with ID ${id} not found`);
    }
    product.status = !product.status;
    product.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async addImage(productId: number, imageFilename: Express.Multer.File) {
    let imageurl;
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      imageurl =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }


    const image = this.imageRepo.create({
      //imagePath: `/product-images/${fileName}`, // just the relative path 
      imagePath: imageurl, // just the relative path
      product,
    });

    return this.imageRepo.save(image);
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

    return this.imageRepo.remove(image);
  }

  /*   Let me know if you also need:
  
      Pagination support in findAll
  
      Filtering by user/owner
  
      Soft delete logic
  
      Upload image handling
  
      Controller methods (@Post, @Get, @Patch, etc.)
  
  async findAll({ page, limit }: { page: number; limit: number }) {
    const [items, total] = await this.productRepository.findAndCount({
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { createdAt: 'DESC' },
    });
  
    return {
      data: items,
      total,
      currentPage: +page,
      lastPage: Math.ceil(total / +limit),
    };
  }*/
}
