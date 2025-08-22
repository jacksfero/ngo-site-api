// modules/packing-mode/packing-mode.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PackingModeService } from './packing-mode.service';

@Controller('packing-modes')
export class PackingModeController {
  constructor(private readonly service: PackingModeService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body('name') name: string) {
    return this.service.update(+id, name);
  }

  @Delete(':id')
  deactivate(@Param('id') id: number) {
    return this.service.deactivate(+id);
  }
}
