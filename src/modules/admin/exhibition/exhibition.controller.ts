import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Post()
    @RequirePermissions('create_exhibition')
  @UseInterceptors(FileInterceptor('imageURL'))
  create(@Body() createExhibitionDto: CreateExhibitionDto,@Req() req,
  @UploadedFile() file?: Express.Multer.File,
) {
    return this.exhibitionService.create(createExhibitionDto,req.user,file ?? null);
  }

  @Get()
   @RequirePermissions('read_exhibition')
  findAll() {
    return this.exhibitionService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_exhibition')
  findOne(@Param('id') id: string) {
    return this.exhibitionService.findOne(+id);
  }

  @Patch(':id')
   @RequirePermissions('update_exhibition')
  @UseInterceptors(FileInterceptor('imageURL'))
  update(@Param('id') id: string, @Body() updateExhibitionDto: UpdateExhibitionDto,
  @Req() req,@UploadedFile() file?: Express.Multer.File,) {
   // console.log('Raw body:', req.body);
    return this.exhibitionService.update(+id, updateExhibitionDto,req.user,file ?? null);
  }

  @Delete(':id')
  @RequirePermissions('delete_exhibition')
  remove(@Param('id') id: string) {
    return this.exhibitionService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_exhibition')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.exhibitionService.toggleStatus(id, req.user);
  }

  @Get(':id/products')
  @RequirePermissions('read_exhibition')
  getMappedProducts(@Param('id') id: number) {
    return this.exhibitionService.getMappedProducts(id);
  }

  @Post(':id/map-product')
      @RequirePermissions('create_exhibition')
  addProductMapping(
    @Param('id') displayId: number,
    @Body() body: { productId: number; userId: number },
  ) {
    return this.exhibitionService.addProductMapping(displayId, body.productId, body.userId);
  }

  @Delete('unmap/:mappingId')
      @RequirePermissions('delete_exhibition')
  unmapProduct(@Param('mappingId') mappingId: number) {
    return this.exhibitionService.removeProductMapping(mappingId);
  }



}
