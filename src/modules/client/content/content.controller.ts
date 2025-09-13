import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('currencylist')
  async getActiveCurrency() {
    return this.contentService.getActiveCurrency();
  } 

  @Get('policy/:id')
  async getActivePolicy(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.getActivePolicy(id);
  } 

  @Get('contents/:id')
  async getActiveContent(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.getActiveContent(id);
  } 
}
