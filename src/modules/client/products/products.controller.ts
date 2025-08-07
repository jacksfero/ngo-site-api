import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
 
import { ProductFilterDto } from './dto/product-filter.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


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
