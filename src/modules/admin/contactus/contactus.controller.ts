import { Controller,   Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContactUsService } from './contactus.service';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller()
export class ContactUsController {
  constructor(private readonly contactusService: ContactUsService) {}

  @Post()
  create(@Body() createContactusDto: CreateContactUsDto) {
    return this.contactusService.create(createContactusDto);
  }
 


  @Get()
findAll(@Query() query: PaginationDto) {
  return this.contactusService.findAll(query);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactusDto: UpdateContactUsDto) {
    return this.contactusService.update(+id, updateContactusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactusService.remove(+id);
  }
}
