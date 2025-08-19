import { ConflictException, Injectable,NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Currency } from '../../../shared/entities/currency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not,FindOptionsWhere, Repository } from 'typeorm';
import { CurrencyListDto } from './dto/currency-list.dto';


@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) { }


  async getCurrencyList(): Promise<CurrencyListDto[]> {
    const currency = await this.currencyRepository.find({
      select: ['id', 'code','icon','currency','value'],
      where: { status: true } ,
   //   order: { weightSlot: 'ASC' },
    });

    // const formatted = products.map((p) => ({
    //   id: p.id,
    //   weightSlot: `${p.weightSlot} (${p.costINR} - ${p.CostOthers})`,
    // }));

    return plainToInstance(CurrencyListDto, currency, {
      excludeExtraneousValues: true,
    });
  }


  async create(createCurrencyDto: CreateCurrencyDto, user: any): Promise<Currency> {
    // Check if currency/code combination already exists
    const existingCurrency = await this.currencyRepository.findOne({
      where: [
        { currency: createCurrencyDto.currency.trim() },
        { code: createCurrencyDto.code.trim().toUpperCase() }
      ],
    });

    if (existingCurrency) {
      if (existingCurrency.currency === createCurrencyDto.currency.trim()) {
        throw new ConflictException('Currency name already exists');
      }
      if (existingCurrency.code === createCurrencyDto.code.trim().toUpperCase()) {
        throw new ConflictException('Currency code already exists');
      }
    }

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
 
  // Check if new currency/code conflicts with other records
  if (updateCurrencyDto.currency || updateCurrencyDto.code) {
    const whereConditions: FindOptionsWhere<Currency>[] = [];
    
    if (updateCurrencyDto.currency) {
      whereConditions.push({ 
        currency: updateCurrencyDto.currency.trim(),
        id: Not(id) 
      } as FindOptionsWhere<Currency>);
    }
    
    if (updateCurrencyDto.code) {
      whereConditions.push({ 
        code: updateCurrencyDto.code.trim().toUpperCase(),
        id: Not(id) 
      } as FindOptionsWhere<Currency>);
    }

    const existingCurrency = await this.currencyRepository.findOne({
      where: whereConditions,
    });

    if (existingCurrency) {
      if (existingCurrency.currency === updateCurrencyDto.currency?.trim()) {
        throw new ConflictException('Currency name already exists');
      }
      if (existingCurrency.code === updateCurrencyDto.code?.trim().toUpperCase()) {
        throw new ConflictException('Currency code already exists');
      }
    }
  }

 
 
 
 
 
 
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



  async validateCurrency(currency: string, code: string, excludeId?: number): Promise<{ isCurrencyUnique: boolean, isCodeUnique: boolean }> {
    const where: any[] = [];
    
    if (currency) {
      where.push({ currency: currency.trim() });
    }
    
    if (code) {
      where.push({ code: code.trim().toUpperCase() });
    }
    
    if (excludeId) {
      where.forEach(condition => condition.id = Not(excludeId));
    }

    const existing = await this.currencyRepository.find({
      where: where,
    });

    return {
      isCurrencyUnique: !existing.some(c => c.currency === currency?.trim()),
      isCodeUnique: !existing.some(c => c.code === code?.trim().toUpperCase()),
    };
  }
}


 