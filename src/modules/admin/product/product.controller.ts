import { Controller, Query, Req, UploadedFiles, Get, Post, Body, Patch, Param, Delete, BadRequestException, ParseIntPipe, UploadedFile, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { FilesInterceptor,FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UseInterceptors } from '@nestjs/common';
import { productImageUploadOptions } from './utils/upload-options';
import { UploadProductImageDto } from './dto/upload-product-image.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from './dto/product.dto';
 
import { PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
import { ProductPaginationDto } from './dto/product-pagination.dto';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';
import { ProductListDto } from './dto/product-list.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';



@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('list')
  async getProductList(): Promise<ProductListDto[]> {
    return this.productService.getProductList();
  }



@Post()
//@UseInterceptors(FileInterceptor('defaultImage', productImageUploadOptions))
@UseInterceptors(FileInterceptor('defaultImage'))
create(
  @Body() createProductDto: CreateProductDto,
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
  @Req() req,
) {
 // const imagePath = file?.filename;
  return this.productService.create(createProductDto, req.user, file);
}
 

@Get()
  async findAll(
    @Query(new PaginationClinetPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    @Query() paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    return this.productService.paginate(paginationDto);
  }

 

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

   

  @Patch(':id')
@UseInterceptors(FileInterceptor('defaultImage'))
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateProductDto,
  @Req() req,
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file?: Express.Multer.File
  
) {
  const imagePath = file?.filename;
  return this.productService.update(id, dto,req.user, file ?? null );
}

 


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productService.toggleStatus(id, req.user);
  }


@Post(':product_id/upload-image')
//@UseInterceptors(FileInterceptor('image', productImageUploadOptions))
@UseInterceptors(FileInterceptor('image'))
async uploadImage(
  @Param('product_id', ParseIntPipe) productId: number,
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }
  return this.productService.addImage(productId, file);
}

@Delete('delete-image/:imageId')
async deleteImage(@Param('imageId') imageId: number) {
  return this.productService.deleteImage(imageId);
}






}
