// modules/commission-type/commission-type.controller.ts
import { Controller,Post,Put, Get,Body,ParseIntPipe, Param } from '@nestjs/common';
import { CommissionTypeService } from './commision-type.service';
import { plainToInstance } from 'class-transformer';
import { CommissionTypeDto } from './dto/commission-type.dto';
import { CreateCommissionTypeDto } from './dto/create-commision-type.dto';
import { UpdateCommisionTypeDto } from './dto/update-commision-type.dto';

@Controller('commission-types')
export class CommissionTypeController {
  constructor(private readonly service: CommissionTypeService) {}

  @Post()
  async create(@Body() dto: CreateCommissionTypeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommisionTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Get()
  async findAll() {
    const result = await this.service.findAll();
    return plainToInstance(CommissionTypeDto, result, {
      excludeExtraneousValues: true,
    });
  }
 
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.service.findOne(id);
    return plainToInstance(CommissionTypeDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
