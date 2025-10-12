import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequirePermissions('create_tag')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }
 
  @Get()
  @RequirePermissions('read_tag')
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_tag')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
   @RequirePermissions('update_tag')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
   @RequirePermissions('delete_tag')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
