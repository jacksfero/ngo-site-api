// shipping-time.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ShippingTimeService } from './shipping-time.service';
import { CreateShippingTimeDto } from './dto/create-shipping-time.dto';
import { UpdateShippingTimeDto } from './dto/update-shipping-time.dto';

@Controller('shipping-times')
export class ShippingTimeController {
  constructor(private readonly service: ShippingTimeService) {}

  @Post()
  async create(@Body() dto: CreateShippingTimeDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShippingTimeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
