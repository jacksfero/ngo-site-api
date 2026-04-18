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
  Query,
} from '@nestjs/common';

import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { CONTENT_PAGE, CONTENT_PAGE_LIMIT, CONTENT_PAGE_MAX_LIMIT } from 'src/shared/config/pagination.config';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ContentPaginationDto } from './dto/content-pagination.dto';
import { ContentListDto } from './dto/content-list.dto';

@Controller()
 @Roles('admin','super admin')
export class ContentController {
  constructor(private readonly contentService: ContentService) { }

  // ✅ Create
  @Post()
  @RequirePermissions('create_content')
  create(@Body() dto: CreateContentDto, @Req() req) {
    return this.contentService.create(
      dto,
      req.user?.siteId,      // 🔥 IMPORTANT
      req.user?.sub,
    );
  }

  // ✅ Admin list
  @Get()
  @RequirePermissions('read_content')
  async findAll(
      @Query(new PaginationClinetPipe(CONTENT_PAGE_LIMIT, CONTENT_PAGE_MAX_LIMIT, CONTENT_PAGE))
      paginationDto: ContentPaginationDto, @Req() req
    ): Promise<PaginationResponseDto<ContentListDto>> {
      return this.contentService.findAll(paginationDto,req.user?.siteId);
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