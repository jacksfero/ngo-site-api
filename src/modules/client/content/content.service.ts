import { Injectable, NotFoundException,Logger } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from 'src/shared/entities/currency.entity';
import { Policy } from 'src/shared/entities/policy.entity';
import { Content } from 'src/shared/entities/content.entity';
import { CacheService } from 'src/core/cache/cache.service';
 

@Injectable()
export class ContentService {
   private readonly logger = new Logger(ContentService.name);
  constructor(
    private cacheService: CacheService,

    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,

    @InjectRepository(Policy)
    private readonly policyRepo: Repository<Policy>,

    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
 
  ){}
  
  async getActiveCurrency() {
    try {
      const cacheKey = 'frontend:currency:active';
      const results = await this.currencyRepo.find({
        where: { status: true },
        select: ['id', 'currency', 'code', 'value', 'icon'],
      });
      if (results.length === 0) {
        throw new NotFoundException('Currency Not Found'); // Use a specific NotFoundException if you want
      }
      // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, results,  );

  return results;
      return results;
    } catch (error) {
      // Optionally, log or rethrow with additional context
      throw new Error(`Error fetching currency: ${error.message}`);
    }
  }
 
  async getActivePolicy(id:number) {
    try {
       const cacheKey = `frontend:policy:active: ${id}`;
      const cached = await this.cacheService.get (cacheKey);
        if (cached ) {
          return cached;
        }
      const results = await this.policyRepo.findOne({
        where: { status: true,id:id },
        select: ['id', 'title', 'remarks', 'policyDetails', ],
      });
      if (!results) {
        throw new NotFoundException('policy Not Found'); // Use a specific NotFoundException if you want
      }
         this.cacheService.set(cacheKey, results);
      return results;
    } catch (error) {
      // Optionally, log or rethrow with additional context
      throw new Error(`Error fetching policy: ${error.message}`);
    }
  }

async getActiveContent(id: number) {
    const cacheKey = `frontend:content:active:${id}`;
    
    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      this.logger.warn(`Cache failed for ${cacheKey}, falling back to DB`);
      // Continue to database fallback
    }

    // Let database errors propagate naturally
    const results = await this.contentRepo.findOne({
      where: { status: true, id },
      select: ['id', 'title', 'remarks', 'contents'],
    });

    if (!results) {
      throw new NotFoundException('Content Not Found');
    }

    // Cache in background, don't await (fire and forget)
    this.cacheService.set(cacheKey, results).catch(err => {
      this.logger.warn(`Failed to cache content ${id}`, err);
    });

    return results;
  }
  

}
