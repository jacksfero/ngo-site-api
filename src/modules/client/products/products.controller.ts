import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
 
import { ProductFilterDto } from './dto/product-filter.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('activecategorylist')
  getActiveCategoryList() {
    return this.productsService.getActiveCategoryList();
  }
 
  @Get('stylelist')
  getActiveStyleList() {
    return this.productsService.getActiveStyleList();
  } 
  @Get('surfacelist')
  getActiveSurfaceList() {
    return this.productsService.getActiveSurfaceList();
  }
 
  @Get('mediumlist')
  getActiveMediumList() {
    return this.productsService.getActiveMediumList();
  }
  @Get('subjectlist')
  getActiveSubjectList() {
    return this.productsService.getActiveSubjectList();
  }
  @Get('surfaceprodlist/:slug')
  getActiveProdSurfaceList(@Param('slug') slug: string) {
    return this.productsService.getActiveProdSurfaceList(slug);
  }
 
  @Get('mediumprodlist/:slug')
  getActiveProdMediumList(@Param('slug') slug: string) {
    return this.productsService.getActiveProdMediumList(slug);
  }

  @Get('subjectprodlist/:slug')
  getActiveProdSubjectList(@Param('slug') slug: string) {
    return this.productsService.getActiveProdSubjectList(slug);
  }

  @Get('styleprodlist/:slug')
  getActiveProdStyleList(@Param('slug') slug: string) {
    return this.productsService.getActiveProdStyleList(slug);
  }

  @Get('stylecontent/:slug')
  getStyleContentBySlug(@Param('slug') slug: number) {
    return this.productsService.getStyleContentBySlug(slug);
  }
  @Get('subjectcontent/:slug')
  getSubjectContentBySlug(@Param('slug') slug: number) {
    return this.productsService.getSubjectContentBySlug(slug);
  }

 @Get()
  getAllProducts(@Query() filterDto: ProductFilterDto) {
    return this.productsService.findAll(filterDto);
  }



@Get('dss')
async getAllProductss(@Query() query: PaginationDto) {
  return this.productsService.findAllssssss(query);
}



    @Get(':id')
  getSingleProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
 








/*
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }*/


}
