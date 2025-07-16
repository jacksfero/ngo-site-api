import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SurfaceService } from './surface.service';
import { CreateSurfaceDto } from './dto/create-surface.dto';
import { UpdateSurfaceDto } from './dto/update-surface.dto';

@Controller('surface')
export class SurfaceController {
  constructor(private readonly surfaceService: SurfaceService) {}

  @Post()
  create(@Body() createSurfaceDto: CreateSurfaceDto) {
    return this.surfaceService.create(createSurfaceDto);
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
  update(@Param('id') id: string, @Body() updateSurfaceDto: UpdateSurfaceDto) {
    return this.surfaceService.update(+id, updateSurfaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surfaceService.remove(+id);
  }
}
