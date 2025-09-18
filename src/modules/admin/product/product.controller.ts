import { Controller, Query, Req, UploadedFiles, Get, Post, Body, Patch, Param, Delete, BadRequestException, ParseIntPipe, UploadedFile, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { FilesInterceptor,FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UseInterceptors } from '@nestjs/common';
 
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from './dto/product.dto';
 
import { PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
import { ProductPaginationDto } from './dto/product-pagination.dto';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';
import { ProductListDto } from './dto/product-list.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';



@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('list')
  @RequirePermissions('read_artwork')
  async getProductList(): Promise<ProductListDto[]> {
    return this.productService.getProductList();
  }



@Post()
@RequirePermissions('create_artwork')
@UseInterceptors(FileInterceptor('defaultImage'))
create(
  @Body() createProductDto: CreateProductDto,
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
  @Req() req,
) { 
  return this.productService.create(createProductDto, req.user, file);
}
 

@Get()
@RequirePermissions('read_artwork')
  async findAll(
    @Query(new PaginationClinetPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    @Query() paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    return this.productService.paginate(paginationDto);
  }

 

  @Get(':id')
  @RequirePermissions('read_artwork')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

   

  @Patch(':id')
  @RequirePermissions('update_artwork')
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
  @RequirePermissions('delete_artwork')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_artwork')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productService.toggleStatus(id, req.user);
  }


@Post(':product_id/upload-image')
@RequirePermissions('create_artwork')
@UseInterceptors(FileInterceptor('image'))
async uploadImage(
  @Param('product_id', ParseIntPipe) productId: number,
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
  @Body('alt_text') alt_text?: string,
) {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }
  return this.productService.addImage(productId, file,alt_text ?? null);
}


@Patch('image/:image_id/alt-text')
@RequirePermissions('update_artwork')
async updateImageAltText(
  @Param('image_id', ParseIntPipe) imageId: number,
  @Body('alt_text') altText: string,
) {
  if (!altText) {
    throw new BadRequestException('alt_text is required');
  }
  return this.productService.updateImageAltText(imageId, altText);
}

@Delete('delete-image/:imageId')
@RequirePermissions('update_artwork')
async deleteImage(@Param('imageId') imageId: number) {
  return this.productService.deleteImage(imageId);
}






}
