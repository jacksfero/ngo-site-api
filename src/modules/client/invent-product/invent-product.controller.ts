import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { InventProductService } from './invent-product.service';
import { CreateInventProductDto } from './dto/create-invent-product.dto';
import { UpdateInventProductDto } from './dto/update-invent-product.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { FRONT_INVENT_PRODUCTS_PAGE,FRONT_INVENT_PRODUCTS_MAX_LIMIT,FRONT_INVENT_PRODUCTS_LIMIT } from 'src/shared/config/pagination.config';
import { InventProdPaginatDto } from './dto/invent-product-paginate.dto';
import { InventProdListDto } from './dto/invent-prod-list.dto';
import { InventProductDetailResponseDto } from './dto/invent-product-detail-response.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';

@Controller()
export class InventProductController {
  constructor(private readonly inventProductService: InventProductService) {}

  
  @Get()
  async findAll(
    @Query(new PaginationClinetPipe(FRONT_INVENT_PRODUCTS_LIMIT, FRONT_INVENT_PRODUCTS_MAX_LIMIT, FRONT_INVENT_PRODUCTS_PAGE))
    @Query() paginationDto: InventProdPaginatDto,
  ): Promise<PaginationResponseDto<InventProdListDto>> {
    return this.inventProductService.findAll(paginationDto);
  } 

  // async findAll(
  //   @Query(new PaginationPipe(FRONT_INVENT_PRODUCTS_LIMIT, FRONT_INVENT_PRODUCTS_MAX_LIMIT, FRONT_INVENT_PRODUCTS_PAGE), 
  //         // new ValidationPipe({ transform: true })
  //         ) // Add ValidationPipe here if needed
  //   paginationDto: InventProdPaginatDto,
  // ): Promise<PaginationResponseDto<InventProdListDto>> {
  //   return this.inventProductService.findAll(paginationDto);
  // }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<InventProductDetailResponseDto> {
    return this.inventProductService.findOne(id);
  }

  
}
