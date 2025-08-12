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
import { S3Service } from 'src/shared/s3/s3.service';
 

@Injectable()
export class ProductService {
  constructor(
    private readonly s3service: S3Service,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

     @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,
  ) { }
 
async create(dto: CreateProductDto, user: any, imageFilename?:Express.Multer.File ): Promise<Product> {
  
  let titleImage: string | null = null;
  if(imageFilename){
    const key = `products/${Date.now()}-${imageFilename.originalname}`;
    titleImage = 
  await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype); 
  }
  
  const product = this.productRepository.create({
    ...dto,
   // defaultImage: imageFilename ? `/product-images/${imageFilename}` : null,
   defaultImage: titleImage,
    createdBy: user.sub.toString(),
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

  async update(
  id: number,
  updateProductDto: UpdateProductDto,   user: any,
  newImageFilename?: Express.Multer.File|null,
 
): Promise<Product> {
  let titleImage:string|null;
  const product = await this.findOne(id);
  if (!product) throw new NotFoundException('Product not found');

  // ✅ Delete old image if new one is uploaded
  if (newImageFilename) {
    const key = `products/${Date.now()}-${newImageFilename.originalname}`;
  
    // Upload new image
    const titleImage = await this.s3service.uploadBuffer(
      key,
      newImageFilename.buffer,
      newImageFilename.mimetype
    );
    if(product.defaultImage)
      {
        await this.s3service.deleteObject(product.defaultImage);
      }
     

    product.defaultImage = titleImage;
  }

  const updated = Object.assign(product, updateProductDto);
  updated.updatedBy = user.sub.toString();
  return this.productRepository.save(updated);
}


 async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
 
  
    
    

async addImage(productId: number, imageFilename:Express.Multer.File) {
  let imageurl;
  const product = await this.productRepository.findOne({ where: { id: productId } });
  
  if (!product)
    {
      throw new NotFoundException('Product not found');
    }
  if(imageFilename){
    const key = `products/${Date.now()}-${imageFilename.originalname}`;
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
*/

}
