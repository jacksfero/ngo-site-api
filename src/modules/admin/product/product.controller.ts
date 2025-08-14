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
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
import { ProductPaginationDto } from './dto/product-pagination.dto';



@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }



@Post()
//@UseInterceptors(FileInterceptor('defaultImage', productImageUploadOptions))
@UseInterceptors(FileInterceptor('defaultImage'))
create(
  @Body() createProductDto: CreateProductDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req,
) {
 // const imagePath = file?.filename;
  return this.productService.create(createProductDto, req.user, file);
}

  


@Get()
  async findAll(
    @Query(new PaginationPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    @Query() paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    return this.productService.paginate(paginationDto);
  }


  // @Get()
  // findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
  //   return this.productService.findAll({ page, limit });
  // }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  //  @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
  //   return this.productService.update(+id, updateProductDto, req.user);
  // }
 
 

  @Patch(':id')
@UseInterceptors(FileInterceptor('defaultImage', productImageUploadOptions))
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateProductDto,@Req() req,
  @UploadedFile() file?: Express.Multer.File,
  
) {
  const imagePath = file?.filename;
  return this.productService.update(id, dto,req.user, file ?? null );
}








  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }



@Post(':product_id/upload-image')
//@UseInterceptors(FileInterceptor('image', productImageUploadOptions))
@UseInterceptors(FileInterceptor('image'))
async uploadImage(
  @Param('product_id', ParseIntPipe) productId: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }
  return this.productService.addImage(productId, file);
}








}
