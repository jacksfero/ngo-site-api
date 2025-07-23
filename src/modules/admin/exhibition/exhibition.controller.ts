import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Controller()
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Post()
  create(@Body() createExhibitionDto: CreateExhibitionDto,@Req() req) {
    return this.exhibitionService.create(createExhibitionDto,req.user);
  }

  @Get()
  findAll() {
    return this.exhibitionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exhibitionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExhibitionDto: UpdateExhibitionDto) {
    return this.exhibitionService.update(+id, updateExhibitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exhibitionService.remove(+id);
  }

  @Get(':id/products')
  getMappedProducts(@Param('id') id: number) {
    return this.exhibitionService.getMappedProducts(id);
  }

  @Post(':id/map-product')
  addProductMapping(
    @Param('id') displayId: number,
    @Body() body: { productId: number; userId: number },
  ) {
    return this.exhibitionService.addProductMapping(displayId, body.productId, body.userId);
  }

  @Delete('unmap/:mappingId')
  unmapProduct(@Param('mappingId') mappingId: number) {
    return this.exhibitionService.removeProductMapping(mappingId);
  }



}
