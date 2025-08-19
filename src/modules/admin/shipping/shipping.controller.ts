import { Controller,ParseIntPipe, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ShippingListDto } from './dto/shipping-list.dto';
import { GstSlotResponseDto } from './dto/gst-slot-response.dto';
 

@Controller()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) { }

  @Get('list')
  async getShippingList(): Promise<ShippingListDto[]> {
    return this.shippingService.getShippingList();
  } 

  @Get('gstslotlist')
  getShippingGstSlot(): GstSlotResponseDto[] {
    return this.shippingService.getShippingGstSlot();
  }

  @Get('artworkgstslotlist')
  getArtGstSlot(): GstSlotResponseDto[] {
    return this.shippingService.getArtGstSlot();
  }
  
  @Post()
  create(@Body() createShippingDto: CreateShippingDto, @Req() req) {
    return this.shippingService.create(createShippingDto, req.user);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingDto: UpdateShippingDto, @Req() req) {
    return this.shippingService.update(+id, updateShippingDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(+id);
  }

  @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.shippingService.toggleStatus(id, req.user);
    }


}
