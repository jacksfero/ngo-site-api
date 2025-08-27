import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from '../../../shared/entities/product-image.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
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
    const products = await this.productRepository.find({
      select: ['id', 'productTitle'],
      where: { status: true },
      order: { productTitle: 'ASC' },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      productTitle: `${p.productTitle} (IG${p.id})`,
    }));

    return plainToInstance(ProductListDto, formatted, {
      excludeExtraneousValues: true,
    });
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

    const product = this.productRepository.create({
      ...dto,
      defaultImage: titleImage,
      // subjects: subjectss,
      //  styles: styless,

      category: { id: dto.category_id } as Productcategory,
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
     console.log('product-before--',product.packingModeId)
    //Object.assign(product, updateProductDto);
     console.log('product--after-',product.packingModeId); 
     
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
  product.updatedBy = user.sub.toString();
    product.updatedBy = user.sub.toString();
    product.category = { id: updateProductDto.category_id } as Productcategory;
    product.packingMode = { id: updateProductDto.packingModeId } as PackingModeEntity;
    product.commissionType = { id: updateProductDto.commissionTypeId } as CommissionType;
    product.shippingTime = { id: updateProductDto.shippingTimeId } as ShippingTime;
    product.size = { id: updateProductDto.size_id } as Size;
    console.log('--------product--after-',product.packingModeId); 
    console.log('product--after-final',product.packingModeId); 
    return this.productRepository.save(product);
  }

 
  async paginate(
    paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.name LIKE :search', { search: `%${search}%` });
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
      relations: ['owner', 'wishlists', 'displayMappings'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
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
