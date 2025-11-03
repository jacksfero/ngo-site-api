import { Controller,   Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContactUsService } from './contactus.service';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { BLOG_LIMIT,BLOG_MAX_LIMIT,BLOG_PAGE } from 'src/shared/config/pagination.config';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ContactPaginationDto } from './dto/contact-pagination.dto';
import { ContactListDto } from './dto/contact-list.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { CacheService } from 'src/core/cache/cache.service';


@Controller()
export class ContactUsController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly contactusService: ContactUsService) {}

  @Post()

  create(@Body() createContactusDto: CreateContactUsDto) {
    return this.contactusService.create(createContactusDto);
  }
 


//   @Get()
// findAll(@Query() query: PaginationDto) {
//   return this.contactusService.findAll(query);
// }

@Get()
 @RequirePermissions('read_contactus')
async findAll(
  @Query(new PaginationClinetPipe(BLOG_LIMIT, BLOG_MAX_LIMIT, BLOG_PAGE))
  paginationDto: ContactPaginationDto
): Promise<PaginationResponseDto<ContactListDto>> {
  return this.contactusService.findAll(paginationDto);
}

// @Get('clear-cache')  
// async clearCache() {
//   return this.contactusService.clearCache();
// }


 @Post('clear-cache')
  @RequirePermissions('manage_cache') // optional: use a stronger permission
  async clearCache(): Promise<{ success: boolean; message: string }> {
    try {
      await this.cacheService.deletePattern('Admin:*');
      await this.cacheService.deletePattern('frontend:*');

      return {
        success: true,
        message: 'Cache cleared successfully',
      };
    } catch (error) {
      console.error('Cache clearance failed:', error);
      return {
        success: false,
        message: 'Failed to clear cache',
      };
    }
  }

  @Get(':id')
  @RequirePermissions('read_contactus')
  findOne(@Param('id') id: string) {
    return this.contactusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactusDto: UpdateContactUsDto) {
    return this.contactusService.update(+id, updateContactusDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_contactus')
  remove(@Param('id') id: string) {
    return this.contactusService.remove(+id);
  }
}
