import { Controller,Query, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { INVENTORY_LIMIT,INVENTORY_MAX_LIMIT,INVENTORY_PAGE } from 'src/shared/config/pagination.config';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { InventoryPaginationDto } from './dto/inventory-pagination.dto';
import { InventoryResponseDto } from './dto/inventry-response.dto';
import { InventoryStatusDto } from './dto/inventory-status.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';


@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

 /* @Get('statuses')
  getStatuses(): InventoryStatusDto[] {
    return this.inventoryService.getStatuses();
  }
*/


  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }
 
  @Get()
  async findAll(
    @Query(new PaginationClinetPipe(INVENTORY_LIMIT, INVENTORY_MAX_LIMIT, INVENTORY_PAGE))
    @Query() paginationDto: InventoryPaginationDto,
  ): Promise<PaginationResponseDto<InventoryResponseDto>> 
  {
   // console.log('INVENTORY_LIMIT----',INVENTORY_LIMIT);
    return this.inventoryService.findAll(paginationDto);
  } 
  
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: number) {
    return this.inventoryService.findByProduct(+productId);
  }

  

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, dto);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.inventoryService.toggleStatus(id, req.user);
  }




  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.inventoryService.remove(+id);
  } 
}
