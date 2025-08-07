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
//import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@Controller()
export class SurfaceController {
  constructor(private readonly surfaceService: SurfaceService) {}

  @Get('list')
  getActiveList() {
    return this.surfaceService.getActiveList();
  }

  @Post()
  create(@Body() createSurfaceDto: CreateSurfaceDto, @Req() req) {
    const user = req.user; // Contains `sub`, `username`, `roles`, `permissions`
    return this.surfaceService.create(createSurfaceDto, user);
  }

  @Get()
  findAll() {
    return this.surfaceService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surfaceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSurfaceDto: UpdateSurfaceDto,@Req() req) {
    return this.surfaceService.update(+id, updateSurfaceDto, req.user);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.surfaceService.toggleStatus(id, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surfaceService.remove(+id);
  }
}
