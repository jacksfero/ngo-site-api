import { Controller, Get, Post,ParseIntPipe, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(@Body() createContentDto: CreateContentDto,@Req() req) {
    return this.contentService.create(createContentDto,req.user);
  }

  @Get()
  findAll() {
    return this.contentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto,@Req() req) {
    return this.contentService.update(+id, updateContentDto,req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(+id);
  }


   @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.contentService.toggleStatus(id, req.user);
    }
}
