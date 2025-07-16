import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MediumService } from './medium.service';
import { CreateMediumDto } from './dto/create-medium.dto';
import { UpdateMediumDto } from './dto/update-medium.dto';

@Controller('medium')
export class MediumController {
  constructor(private readonly mediumService: MediumService) {}

  @Post()
  create(@Body() createMediumDto: CreateMediumDto) {
    return this.mediumService.create(createMediumDto);
  }

  @Get()
  findAll() {
    return this.mediumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediumService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediumDto: UpdateMediumDto) {
    return this.mediumService.update(+id, updateMediumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediumService.remove(+id);
  }
}
