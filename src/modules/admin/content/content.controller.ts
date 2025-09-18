import { Controller, Get, Post,ParseIntPipe, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @RequirePermissions('create_article')
  create(@Body() createContentDto: CreateContentDto,@Req() req) {
    return this.contentService.create(createContentDto,req.user);
  }

  @Get()
  @RequirePermissions('read_article')
  findAll() {
    return this.contentService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read_article')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_article')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto,@Req() req) {
    return this.contentService.update(+id, updateContentDto,req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_article')
  remove(@Param('id') id: string) {
    return this.contentService.remove(+id);
  }


   @Patch(':id/toggle-status')
   @RequirePermissions('update_article')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.contentService.toggleStatus(id, req.user);
    }
}
