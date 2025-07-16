import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactusService } from './contactus.service';
import { CreateContactusDto } from './dto/create-contactus.dto';
import { UpdateContactusDto } from './dto/update-contactus.dto';

@Controller('contactus')
export class ContactusController {
  constructor(private readonly contactusService: ContactusService) {}

  @Post()
  create(@Body() createContactusDto: CreateContactusDto) {
    return this.contactusService.create(createContactusDto);
  }

  @Get()
  findAll() {
    return this.contactusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactusDto: UpdateContactusDto) {
    return this.contactusService.update(+id, updateContactusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactusService.remove(+id);
  }
}
