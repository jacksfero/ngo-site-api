import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { InventProductService } from './invent-product.service';
import { CreateInventProductDto } from './dto/create-invent-product.dto';
import { UpdateInventProductDto } from './dto/update-invent-product.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { FRONT_INVENT_PRODUCTS_PAGE,FRONT_INVENT_PRODUCTS_MAX_LIMIT,FRONT_INVENT_PRODUCTS_LIMIT } from 'src/shared/config/pagination.config';
import { InventProdPaginatDto } from './dto/invent-product-paginate.dto';
import { InventProdListDto } from './dto/invent-prod-list.dto';
import { InventProductDetailResponseDto } from './dto/invent-product-detail-response.dto';

@Controller()
export class InventProductController {
  constructor(private readonly inventProductService: InventProductService) {}

  @Post()
  create(@Body() createInventProductDto: CreateInventProductDto) {
    return this.inventProductService.create(createInventProductDto);
  }

  @Get()
  async findAll(
    @Query(new PaginationPipe(FRONT_INVENT_PRODUCTS_LIMIT, FRONT_INVENT_PRODUCTS_MAX_LIMIT, FRONT_INVENT_PRODUCTS_PAGE))
    @Query() paginationDto: InventProdPaginatDto,
  ): Promise<PaginationResponseDto<InventProdListDto>> {
    return this.inventProductService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InventProductDetailResponseDto> {
    return this.inventProductService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventProductDto: UpdateInventProductDto) {
    return this.inventProductService.update(+id, updateInventProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventProductService.remove(+id);
  }
}
