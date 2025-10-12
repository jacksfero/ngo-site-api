import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { ProductcategoryService } from './productcategory.service';
import { CreateProductcategoryDto } from './dto/create-productcategory.dto';
import { UpdateProductcategoryDto } from './dto/update-productcategory.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class ProductcategoryController {
  constructor(private readonly productcategoryService: ProductcategoryService) {}

  @Get('list')
  @RequirePermissions('read_artwork_category')
  getActiveList() {
    return this.productcategoryService.getActiveList();
  }


  @Post()
  @RequirePermissions('create_artwork_category')
  create(@Body() createProductcategoryDto: CreateProductcategoryDto, @Req() req) {
    return this.productcategoryService.create(createProductcategoryDto,req.user);
  }

  @Get()
  @RequirePermissions('read_artwork_category')
  findAll() {
    return this.productcategoryService.findAll();
  }


@Patch(':id/toggle-status')
@RequirePermissions('update_artwork_category')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productcategoryService.toggleStatus(id, req.user);
  }


  @Get(':id')
  @RequirePermissions('read_artwork_category')
  findOne(@Param('id') id: string) {
    return this.productcategoryService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_artwork_category')
  update(@Param('id') id: string, @Body() updateProductcategoryDto: UpdateProductcategoryDto, @Req() req) {
    return this.productcategoryService.update(+id, updateProductcategoryDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_artwork_category')
  remove(@Param('id') id: string) {
    return this.productcategoryService.remove(+id);
  }
}
