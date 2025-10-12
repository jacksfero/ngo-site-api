import { Controller,ParseIntPipe, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StyleService } from './style.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class StyleController {
  constructor(private readonly styleService: StyleService) { }

  @Get('list')
  @RequirePermissions('read_style')
  getActiveList() {
    return this.styleService.getActiveList();
  }



  @Post()
  @RequirePermissions('create_style')
  create(@Body() createStyleDto: CreateStyleDto, @Req() req) {
    return this.styleService.create(createStyleDto, req.user);
  }

  @Get()
  @RequirePermissions('read_style')
  findAll() {
    return this.styleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read_style')
  findOne(@Param('id') id: string) {
    return this.styleService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_style')
  update(@Param('id') id: string, @Body() updateStyleDto: UpdateStyleDto, @Req() req) {
    return this.styleService.update(+id, updateStyleDto,req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_style')
  remove(@Param('id') id: string) {
    return this.styleService.remove(+id);
  }
   @Patch(':id/toggle-status')
   @RequirePermissions('update_style')
      async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.styleService.toggleStatus(id, req.user);
      }
}
