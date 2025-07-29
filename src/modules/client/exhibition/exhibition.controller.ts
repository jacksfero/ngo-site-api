import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller()
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Get('')
findAllPublic(@Query() paginationDto: PaginationDto) {
 // console.log('aaaaaaaaaaaaaaaa================');
  return this.exhibitionService.findPublicAll(paginationDto);
}

@Get(':id')
findOnePublic(@Param('id', ParseIntPipe) id: number) {
  return this.exhibitionService.findOnePublic(id);
}
}
