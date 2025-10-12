import { Controller,Req, Get,ParseIntPipe, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('list')
   @RequirePermissions('read_category')
  getActiveList() {
    return this.categoryService.getActiveList();
  }
 
  @Post()
   @RequirePermissions('create_category')
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    return this.categoryService.create(createCategoryDto, req.user);
  }

  @Get()
     @RequirePermissions('read_category')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
     @RequirePermissions('read_category')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
     @RequirePermissions('update_category')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
     @RequirePermissions('delete_category')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }

 @Patch(':id/toggle-status')
    @RequirePermissions('update_category')
    async toggleStatus(@Param('id', ParseIntPipe) id: number) {
      return this.categoryService.toggleStatus(id);
    }

}
