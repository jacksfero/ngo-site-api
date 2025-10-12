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
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';


@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

 /* @Get('statuses')
  getStatuses(): InventoryStatusDto[] {
    return this.inventoryService.getStatuses();
  }
*/


  @Post()
   @RequirePermissions('create_inventory')
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }
 
  @Get()
   @RequirePermissions('read_inventory')
  async findAll(
    @Query(new PaginationClinetPipe(INVENTORY_LIMIT, INVENTORY_MAX_LIMIT, INVENTORY_PAGE))
    @Query() paginationDto: InventoryPaginationDto,
  ): Promise<PaginationResponseDto<InventoryResponseDto>> 
  {
   // console.log('INVENTORY_LIMIT----',INVENTORY_LIMIT);
    return this.inventoryService.findAll(paginationDto);
  } 
  
  @Get('product/:productId')
  @RequirePermissions('read_inventory')
  findByProduct(@Param('productId') productId: number) {
    return this.inventoryService.findByProduct(+productId);
  }

  

  @Get(':id')
  @RequirePermissions('read_inventory')
  findOne(@Param('id') id: number) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_inventory')
  update(@Param('id') id: number, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, dto);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_inventory')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.inventoryService.toggleStatus(id, req.user);
  }




  @Delete(':id')
   @RequirePermissions('delete_inventory')
  remove(@Param('id') id: number) {
    return this.inventoryService.remove(+id);
  } 
}
