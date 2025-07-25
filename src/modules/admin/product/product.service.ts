import { Injectable,NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../../../shared/entities/product.entity';
import { ProductImage } from '../../../shared/entities/product-image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from './dto/product.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
 

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

     @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,
  ) { }
/*async create(dto: CreateProductDto,files: Express.Multer.File[], user:any): Promise<Product> {
 //   return this.productRepository.save(dto);

    const product = this.productRepository.create({
      ...dto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
     if (files?.length) {
      const images = files.map((file) => {
        const img = new ProductImage();
        img.imagePath = `/uploads/product-images/${file.filename}`;
        return img;
      });
      product.images = images;
    }
    return this.productRepository.save(product);
  }*/

 async create(dto: CreateProductDto, imagePathsss?: string): Promise<Product> {
  const product = this.productRepository.create({
    ...dto,
    defaultImage: imagePathsss ? `/uploads/products/${imagePathsss}` : null,
  });

  return this.productRepository.save(product);
}

 
 
  async paginate(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
     const { page = 1, limit = 2, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.name LIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginationResponseDto(
      plainToInstance(ProductDto, products),
      {
        total,
        page,
        limit,
      },
    );
  }
 

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

  async update(id: number, updateProductDto: UpdateProductDto,user:any, newImagePath?: string,): Promise<Product> {
    const product = await this.findOne(id);

  /*    // Handle slug regeneration if name is changed
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      product.slug = await this.generateUniqueSlug(updateProductDto.name);
    }
*/
// Handle default image replacement
    if (newImagePath) {
      if (product.defaultImage) {
        const oldImagePath = path.join(
          process.cwd(),
          product.defaultImage.replace(/^\/+/, ''),
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.defaultImage = `/uploads/products/${newImagePath}`;
    }


    const updated = Object.assign(product, updateProductDto);
  //  Object.assign(policy,updatePolicyDto);
    updated.updatedBy = user.sub.toString();
    return this.productRepository.save(updated);
  }

 async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }


  async addImage(productId: number, fileName: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const image = this.imageRepo.create({
      imagePath: `/uploads/product-images/${fileName}`,
      product,
    });

    return this.imageRepo.save(image);
  }
 
   async deleteImage(imageId: number) {
    const image = await this.imageRepo.findOne({ where: { id: imageId }, relations: ['product'] });
    if (!image) throw new NotFoundException('Image not found');

    const fullPath = path.join(process.cwd(), 'uploads/product-images', path.basename(image.imagePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.imageRepo.remove(image);
  }

/*   Let me know if you also need:

    Pagination support in findAll

    Filtering by user/owner

    Soft delete logic

    Upload image handling

    Controller methods (@Post, @Get, @Patch, etc.)
*/

}
