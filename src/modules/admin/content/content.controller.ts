import {
  Controller,
  Get,
  Post,
  ParseIntPipe,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';

import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) { }

  // ✅ Create
  @Post()
  @RequirePermissions('create_content')
  create(@Body() dto: CreateContentDto, @Req() req) {
    return this.contentService.create(
      dto,
      req.site.id,      // 🔥 IMPORTANT
      req.user?.id,
    );
  }

  // ✅ Admin list
  @Get()
  @RequirePermissions('read_content')
  findAll(@Req() req) {
    return this.contentService.findAll(req.site.id);
  }

  // ✅ Get by ID (admin)
  @Get(':id')
  @RequirePermissions('read_content')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.contentService.findOne(id, req.site.id);
  }

  // ✅ Update
  @Patch(':id')
  @RequirePermissions('update_content')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentDto,
    @Req() req,
  ) {
    return this.contentService.update(
      id,
      dto,
      req.site.id,
    );
  }

  // ✅ Delete
  @Delete(':id')
  @RequirePermissions('delete_content')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.contentService.remove(id, req.site.id);
  }

  // ✅ Toggle status
  @Patch(':id/toggle-status')
  @RequirePermissions('update_content')
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.contentService.toggleStatus(id, req.site.id);
  }

  // 🌐 Public API (VERY IMPORTANT)
  // @Get('page/:slug')
  // findBySlug(@Param('slug') slug: string, @Req() req) {
  //   return this.contentService.findBySlug(req.site.id, slug);
  // }
}