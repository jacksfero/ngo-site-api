import { Injectable,NotFoundException } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Currency } from '../../../shared/entities/currency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) { }

  async create(createCurrencyDto: CreateCurrencyDto, user: any): Promise<Currency> {
    const currency = this.currencyRepository.create({
      ...createCurrencyDto,
      createdBy: user.sub.toString(), //userid
    });
    return this.currencyRepository.save(currency);
  }

  async findAll(): Promise<Currency[]> {
    const result = await this.currencyRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      /* where: {
        status: true, // only active surfaces
      },*/
    });
    return result;
  }

 async findOne(id: number): Promise<Currency>  {
    const currency = await this.currencyRepository.findOne({ where: { id } });
     if (!currency) throw new NotFoundException(`currency ${id} not found`);
     return currency;
  }

 async update(id: number, updateCurrencyDto: UpdateCurrencyDto,user:any): Promise<Currency>  {
    const currency = await this.findOne(id);
    Object.assign(currency,updateCurrencyDto);
    currency.updatedBy = user.sub.toString();
    return this.currencyRepository.save(currency);
  }

  async remove(id: number): Promise<void> {
    const currency = await this.findOne(id);
    await this.currencyRepository.remove(currency);
  }

  // currency.service.ts
  async toggleStatus(id: number, user: any): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException(`currency   with ID ${id} not found`);
    }
    currency.status = !currency.status;
    currency.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.currencyRepository.save(currency);
  }
}
