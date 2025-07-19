import { Controller,ParseIntPipe, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StyleService } from './style.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';

@Controller()
export class StyleController {
  constructor(private readonly styleService: StyleService) { }

  @Post()
  create(@Body() createStyleDto: CreateStyleDto, @Req() req) {
    return this.styleService.create(createStyleDto, req.user);
  }

  @Get()
  findAll() {
    return this.styleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.styleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStyleDto: UpdateStyleDto, @Req() req) {
    return this.styleService.update(+id, updateStyleDto,req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.styleService.remove(+id);
  }
   @Patch(':id/toggle-status')
      async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.styleService.toggleStatus(id, req.user);
      }
}
