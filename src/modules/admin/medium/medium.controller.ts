import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { MediumService } from './medium.service';
import { CreateMediumDto } from './dto/create-medium.dto';
import { UpdateMediumDto } from './dto/update-medium.dto';

@Controller()
export class MediumController {
  constructor(private readonly mediumService: MediumService) {}

  @Post()
  create(@Body() createMediumDto: CreateMediumDto, @Req() req) {
    const user = req.user;
    return this.mediumService.create(createMediumDto, user);
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
  update(@Param('id') id: string, @Body() updateMediumDto: UpdateMediumDto, @Req() req) {
    return this.mediumService.update(+id, updateMediumDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediumService.remove(+id);
  }

   @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.mediumService.toggleStatus(id, req.user);
    }
}
