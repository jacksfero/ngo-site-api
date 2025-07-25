import { Controller, Query, Req, UploadedFiles, Get, Post, Body, Patch, Param, Delete, BadRequestException, ParseIntPipe, UploadedFile, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('defaultImage', 1, productImageUploadOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imagePath = files?.[0]?.filename;
    return this.productService.create(createProductDto, imagePath);
  }

  /*
  
  @Post()  
     @UseInterceptors(FilesInterceptor('defaultImage',1, productImageUploadOptions))
    createaass( @Body() createProductDto: CreateProductDto, @UploadedFiles() file?: Express.Multer.File,  @Req() req) {
       const imagePath = file?.filename;
      return this.productService.createaass(createProductDto,imagePath, req.user);
    }
  
  
  
  
  
  
  
  
  
  
  
    @Post()
    @UseInterceptors(
      FilesInterceptor('images', 5, {
        storage: diskStorage({
          destination: './uploads/product-images',
          filename: (_, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${unique}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (_, file, cb) => {
          const allowed = ['.png', '.jpg', '.jpeg'];
          const ext = extname(file.originalname).toLowerCase();
          cb(null, allowed.includes(ext));
        },
      }),
    )
    create( @Body() createProductDto: CreateProductDto,
      @UploadedFiles() images: Express.Multer.File[], @Req() req) {
      return this.productService.create(createProductDto,images, req.user);
    }
  */



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

   @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    return this.productService.update(+id, updateProductDto, req.user);
  }
 


  @Patch(':id')
  @UseInterceptors(FilesInterceptor('defaultImage',1, productImageUploadOptions))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.productService.update(
      id,
      dto,
      req.user,
      file?.filename,
    );
  }









  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }



  @Post('upload-image')
  @UseInterceptors(FilesInterceptor('image', 1, productImageUploadOptions))
  async uploadImage(
    @UploadedFiles() file: Express.Multer.File,
    @Body() body: UploadProductImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.productService.addImage(body.productId, file.filename);
  }

  @Delete('delete-image/:imageId')
  async deleteImage(@Param('imageId') imageId: number) {
    return this.productService.deleteImage(imageId);
  }








}
