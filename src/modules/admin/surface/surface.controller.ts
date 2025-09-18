import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SurfaceService } from './surface.service';
import { CreateSurfaceDto } from './dto/create-surface.dto';
import { UpdateSurfaceDto } from './dto/update-surface.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
 
@Controller()
export class SurfaceController {
  constructor(private readonly surfaceService: SurfaceService) {}

  @Get('list')
  @RequirePermissions('create_surface')
  getActiveList() {
    return this.surfaceService.getActiveList();
  }

  @Post()
  @RequirePermissions('read_surface')
  create(@Body() createSurfaceDto: CreateSurfaceDto, @Req() req) {
    const user = req.user; // Contains `sub`, `username`, `roles`, `permissions`
    return this.surfaceService.create(createSurfaceDto, user);
  }

  @Get()
  @RequirePermissions('read_surface')
  findAll() {
    return this.surfaceService.findAll();
  }

  
  @Get(':id')
  @RequirePermissions('read_surface')
  findOne(@Param('id') id: string) {
    return this.surfaceService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_surface')
  update(@Param('id') id: string, @Body() updateSurfaceDto: UpdateSurfaceDto,@Req() req) {
    return this.surfaceService.update(+id, updateSurfaceDto, req.user);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_surface')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.surfaceService.toggleStatus(id, req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_surface')
  remove(@Param('id') id: string) {
    return this.surfaceService.remove(+id);
  }
}
