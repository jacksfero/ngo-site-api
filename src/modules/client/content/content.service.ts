import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from 'src/shared/entities/currency.entity';
import { Policy } from 'src/shared/entities/policy.entity';
import { Content } from 'src/shared/entities/content.entity';

 

@Injectable()
export class ContentService {
   
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,

    @InjectRepository(Policy)
    private readonly policyRepo: Repository<Policy>,

    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
 
  ){}
 
 
  async getActiveCurrency() {
    try {
      const results = await this.currencyRepo.find({
        where: { status: true },
        select: ['id', 'currency', 'code', 'value', 'icon'],
      });
      if (results.length === 0) {
        throw new NotFoundException('Currency Not Found'); // Use a specific NotFoundException if you want
      }
      return results;
    } catch (error) {
      // Optionally, log or rethrow with additional context
      throw new Error(`Error fetching currency: ${error.message}`);
    }
  }
 
  async getActivePolicy(id:number) {
    try {
      const results = await this.policyRepo.findOne({
        where: { status: true,id:id },
        select: ['id', 'title', 'remarks', 'policyDetails', ],
      });
      if (!results) {
        throw new NotFoundException('policy Not Found'); // Use a specific NotFoundException if you want
      }
      return results;
    } catch (error) {
      // Optionally, log or rethrow with additional context
      throw new Error(`Error fetching policy: ${error.message}`);
    }
  }

  async getActiveContent(id:number) {
    try {
      const results = await this.contentRepo.findOne({
        where: { status: true,id:id },
        select: ['id', 'title', 'remarks', 'contents', ],
      });
      if (!results) {
        throw new NotFoundException('content Not Found'); // Use a specific NotFoundException if you want
      }
      return results;
    } catch (error) {
      // Optionally, log or rethrow with additional context
      throw new Error(`Error fetching content: ${error.message}`);
    }
  }
  

}
