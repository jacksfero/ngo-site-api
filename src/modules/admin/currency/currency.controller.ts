import { Controller,Req,ParseIntPipe, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyListDto } from './dto/currency-list.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Get('list')
   @RequirePermissions('read_currency')
  async getCurrencyList(): Promise<CurrencyListDto[]> {
    return this.currencyService.getCurrencyList();
  } 

  @Post()
   @RequirePermissions('create_currency')
  create(@Body() createCurrencyDto: CreateCurrencyDto, @Req() req) {
    return this.currencyService.create(createCurrencyDto, req.user);
  }

  @Get()
   @RequirePermissions('read_currency')
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_currency')
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(+id);
  }

  @Patch(':id')
   @RequirePermissions('update_currency')
  update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto,@Req() req) {
    return this.currencyService.update(+id, updateCurrencyDto,req.user);
  }

  @Delete(':id')
   @RequirePermissions('delete_currency')
  remove(@Param('id') id: string) {
    return this.currencyService.remove(+id);
  }

  @Patch(':id/toggle-status')
   @RequirePermissions('update_currency')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.currencyService.toggleStatus(id, req.user);
    }
}
