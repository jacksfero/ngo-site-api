import { Controller,Req,ParseIntPipe, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Post()
  create(@Body() createCurrencyDto: CreateCurrencyDto, @Req() req) {
    return this.currencyService.create(createCurrencyDto, req.user);
  }

  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto,@Req() req) {
    return this.currencyService.update(+id, updateCurrencyDto,req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currencyService.remove(+id);
  }

  @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.currencyService.toggleStatus(id, req.user);
    }
}
