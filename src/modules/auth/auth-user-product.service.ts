import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException, Logger,
  ForbiddenException,
  Inject,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/modules/admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtPayload, RegisterCartUserResponse } from './interfaces/jwt-payload.interface';
import { UserListByRoleNameDto } from '../admin/users/dto/user-list-byrole.dto';

import { RegisterCartUserDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OtpVerification } from 'src/shared/entities/OtpVerification.entity';

 
import { CreateProductDto } from '../admin/product/dto/create-product.dto';
import { S3Service } from 'src/shared/s3/s3.service';
import { Product, ProductStatus } from 'src/shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { ProductPaginationDto } from '../admin/product/dto/product-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from '../admin/product/dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from '../admin/product/dto/update-product.dto';
 
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
 
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { PackingModeEntity } from 'src/shared/entities/packing-mode.entity';
import { CommissionType } from 'src/shared/entities/commission-type.entity';
import { ShippingTime } from 'src/shared/entities/shipping-time.entity';
import { Size } from 'src/shared/entities/size.entity';
import { Orientation } from 'src/shared/entities/orientation.entity';
 
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';
import { slugify } from 'src/shared/utils/slugify';
 

// import { REQUEST } from '@nestjs/core';
  import { Request } from 'express';
import { ProductCreatedPayload, ResetPassCreatedPayload } from 'src/shared/events/interfaces/event-payload.interface';
import { AuthService } from './auth.service';


@Injectable()
export class AuthUserProductService {
   private readonly logger = new Logger(AuthUserProductService.name);
  constructor(
     private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
 
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly s3service: S3Service,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Style)
    private styleRepo: Repository<Style>,

    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,

    
  ) {}
 

  async createProduct(dto: CreateProductDto, user: any, imageFilename?: Express.Multer.File): Promise<Product> {
    const userId = user.sub.toString();
    let titleImage: string | null = null;
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);

      const key = `products/${Date.now()}-${cleanName}`;
      titleImage =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }

    const product = this.productRepository.create({
      ...dto,
      // defaultImage: imageFilename ? `/product-images/${imageFilename}` : null,
      defaultImage: titleImage,
      slug: await this.generateUniqueSlug(dto.slug),
      createdBy: userId,
      category: { id: dto.category_id } as Productcategory,
      ...(dto.surface_id && { surface: { id: dto.surface_id } as Surface }),
      ...(dto.medium_id && { medium: { id: dto.medium_id } as Medium }),
    });
    product.owner = userId;
    product.artist = userId;
    if (dto.subjectsIds?.length) {
      product.subjects = await this.subjectRepo.findBy({ id: In(dto.subjectsIds) });
    }
    if (dto.stylesIds?.length) {
      product.styles = await this.styleRepo.findBy({ id: In(dto.stylesIds) });
    }

    const result = await this.productRepository.save(product);

     const userdetails = await this.authService.getLoggedInUser(user);
 /** Start Mail Service */
      const payload: ProductCreatedPayload = {  
  context: {   
  },   
  productId:  `IG${product.id}`,
  productName: product.productTitle,  
  name: userdetails.username,
  to: userdetails.email, 
  testingNote: 'Testing product update flow',
};
this.eventEmitter.emit('product.created', payload);     
/** End Mail Service */

return result;
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


  async findAllProducts(
    paginationDto: ProductPaginationDto, user: any
  ): Promise<PaginationResponseDto<ProductDto>> {
    const userId = user.sub.toString();
    const { page, limit, search,
      is_active
      //status 
    } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.artist', 'artist')
      .leftJoinAndSelect('product.category', 'category')
      .andWhere('product.createdBy = :createdBy', { createdBy: userId });
    if (search) {
      queryBuilder.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    /* const [result, products] = await queryBuilder.getManyAndCount();
 
     const [result, total] = await queryBuilder.getManyAndCount();*/

    const data = plainToInstance(ProductDto, products, {
      excludeExtraneousValues: true,
    });

    return new PaginationResponseDto(data, { total, page, limit });
  }
  async findOneProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['artist', 'packingMode', 'shippingTime', 'styles', 'subjects', 'commissionType', 'images', 'surface', 'medium', 'category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    user: any,
    newImageFile?: Express.Multer.File | null,
  ): Promise<Product> {
    const product = await this.findOneProduct(id);
    if (!product) throw new NotFoundException('Product not found');

    if (newImageFile) {
      const cleanName = sanitizeFileName(newImageFile.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      //  const key = `products/${Date.now()}-${newImageFile.originalname}`;

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

    //  Object.assign(product, updateProductDto);
    product.updatedBy = user.sub.toString();
    if (updateProductDto.productTitle !== undefined) {
      product.productTitle = updateProductDto.productTitle;
    } if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    } if (updateProductDto.width !== undefined) {
      product.width = updateProductDto.width;
    } if (updateProductDto.height !== undefined) {
      product.height = updateProductDto.height;
    } if (updateProductDto.depth !== undefined) {
      product.depth = updateProductDto.depth;
    } if (updateProductDto.weight !== undefined) {
      product.weight = updateProductDto.weight;
    } if (updateProductDto.created_in !== undefined) {
      product.created_in = updateProductDto.created_in;
    }
    if (updateProductDto.remark_to_artist !== undefined) {
      product.remark_to_artist = updateProductDto.remark_to_artist;
    }


    product.category = { id: updateProductDto.category_id } as Productcategory;
    product.packingMode = { id: updateProductDto.packingModeId } as PackingModeEntity;
    product.commissionType = { id: updateProductDto.commissionTypeId } as CommissionType;
    product.shippingTime = { id: updateProductDto.shippingTimeId } as ShippingTime;
    product.size = { id: updateProductDto.size_id } as Size;

    product.orientation = { id: updateProductDto.orientation_id } as Orientation;

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
 

    return this.productRepository.save(product);
  }


  async addImageProduct(productId: number, imageFilename: Express.Multer.File) {
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
  async updateImageAltText(imageId: number, altText: string) {
    const image = await this.imageRepo.findOne({ where: { id: imageId } });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    image.alt_text = altText;
    await this.imageRepo.save(image);

    return {
      message: 'Alt text updated successfully',
      image,
    };
  }

  async deleteProductImage(imageId: number) {
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

}