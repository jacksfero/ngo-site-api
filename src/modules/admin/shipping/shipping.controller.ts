import { Controller,ParseIntPipe, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ShippingListDto } from './dto/shipping-list.dto';
import { GstSlotResponseDto } from './dto/gst-slot-response.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
 

@Controller()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) { }

  @Get('list')
  @RequirePermissions('read_shipping')
  async getShippingList(): Promise<ShippingListDto[]> {
    return this.shippingService.getShippingList();
  } 

  @Get('gstslotlist')
  @RequirePermissions('read_shipping')
  getShippingGstSlot(): GstSlotResponseDto[] {
    return this.shippingService.getShippingGstSlot();
  }

  @Get('artworkgstslotlist')
  @RequirePermissions('read_shipping')
  getArtGstSlot(): GstSlotResponseDto[] {
    return this.shippingService.getArtGstSlot();
  }
  
  @Post()
  @RequirePermissions('create_shipping')
  create(@Body() createShippingDto: CreateShippingDto, @Req() req) {
    return this.shippingService.create(createShippingDto, req.user);
  }

  @Get()
  @RequirePermissions('read_shipping')
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read_shipping')
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_shipping')
  update(@Param('id') id: string, @Body() updateShippingDto: UpdateShippingDto, @Req() req) {
    return this.shippingService.update(+id, updateShippingDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_shipping')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_shipping')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.shippingService.toggleStatus(id, req.user);
    }


}
