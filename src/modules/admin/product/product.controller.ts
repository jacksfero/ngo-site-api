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



@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }



@Post()
@UseInterceptors(FileInterceptor('defaultImage', productImageUploadOptions))
create(
  @Body() createProductDto: CreateProductDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req,
) {
  const imagePath = file?.filename;
  return this.productService.create(createProductDto, req.user, imagePath);
}

  


@Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
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
  @Body() dto: UpdateProductDto,
  @UploadedFile() file: Express.Multer.File,
  @Request() req,
) {
  const imagePath = file?.filename;
  return this.productService.update(id, dto, req.user, imagePath);
}








  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }



@Post(':product_id/upload-image')
@UseInterceptors(FileInterceptor('image', productImageUploadOptions))
async uploadImage(
  @Param('product_id', ParseIntPipe) productId: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }
  return this.productService.addImage(productId, file.filename);
}








}
