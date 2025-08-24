import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrientationService } from './orientation.service';
import { CreateOrientationDto } from './dto/create-orientation.dto';
import { UpdateOrientationDto } from './dto/update-orientation.dto';

@Controller('orientation')
export class OrientationController {
  constructor(private readonly orientationService: OrientationService) {}

  @Post()
  create(@Body() createOrientationDto: CreateOrientationDto) {
    return this.orientationService.create(createOrientationDto);
  }

  @Get()
  findAll() {
    return this.orientationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orientationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSizeDto: UpdateOrientationDto) {
    return this.orientationService.update(+id, updateSizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orientationService.remove(+id);
  }
}
