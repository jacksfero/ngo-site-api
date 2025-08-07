import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { ProductcategoryService } from './productcategory.service';
import { CreateProductcategoryDto } from './dto/create-productcategory.dto';
import { UpdateProductcategoryDto } from './dto/update-productcategory.dto';

@Controller()
export class ProductcategoryController {
  constructor(private readonly productcategoryService: ProductcategoryService) {}

  @Get('list')
  getActiveList() {
    return this.productcategoryService.getActiveList();
  }


  @Post()
  create(@Body() createProductcategoryDto: CreateProductcategoryDto, @Req() req) {
    return this.productcategoryService.create(createProductcategoryDto,req.user);
  }

  @Get()
  findAll() {
    return this.productcategoryService.findAll();
  }


@Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productcategoryService.toggleStatus(id, req.user);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productcategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductcategoryDto: UpdateProductcategoryDto, @Req() req) {
    return this.productcategoryService.update(+id, updateProductcategoryDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productcategoryService.remove(+id);
  }
}
