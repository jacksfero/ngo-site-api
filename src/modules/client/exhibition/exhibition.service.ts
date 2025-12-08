import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ExhibitionListItemDto } from './dto/exhibition-list-item.dto';
import { ExhibitionDetailDto, ExhibitionDetailDtos } from './dto/exhibition-detail.dto';
import { ExhiProductListItemDto, ProductListItemDto } from '../products/dto/product-list-item.dto';
import { CacheService } from 'src/core/cache/cache.service';
import { Currency } from 'src/shared/entities/currency.entity';
import { ExhibitionPageLike } from 'src/shared/entities/exhibition-like.entity';
import { ExhibitionPageView } from 'src/shared/entities/exhibition-view.entity';


@Injectable()
export class ExhibitionService {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(Exhibition)
    private exhibitionRepo: Repository<Exhibition>,

    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,

    @InjectRepository(ExhibitionPageLike)
    private readonly likeRepo: Repository<ExhibitionPageLike>,

    @InjectRepository(ExhibitionPageView)
    private readonly viewRepo: Repository<ExhibitionPageView>,

  ) { }

  async addGlobalLike(viewerIdentifier: string) {
    const existing = await this.likeRepo.findOne({
      where: { viewerIdentifier },
    });

    if (existing) {
      return { success: true, alreadyLiked: true };
    }

    await this.likeRepo.save({ viewerIdentifier });

    await this.exhibitionRepo.increment({}, 'likeCount', 1);

    return { success: true, liked: true };
  }

  async addGlobalView(viewerIdentifier: string) {
    // ✅ Check if already viewed
    const existing = await this.viewRepo.findOne({
      where: { viewerIdentifier },
    });

    if (existing) {
      return { success: true, counted: false }; // ❌ do NOT increase again
    }

    await this.viewRepo.save({ viewerIdentifier });

    // ✅ Increase global counter
    await this.exhibitionRepo.increment({}, 'views', 1);

    return { success: true, counted: true };
  }

  async getExhibitionStats() {
    try {
      const exhibition = await this.exhibitionRepo.find({
        select: ['views', 'likeCount'],
        take: 1,
      });

      return exhibition?.[0] ?? { views: 0, likeCount: 0 };
    } catch (err) {
      console.error('Exhibition stats error:', err);
      throw err;
    }
  }
 

  async findPublicAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<ExhibitionListItemDto>> {

    const { page = 1, limit = 10 } = paginationDto;

    const cacheKey = `frontend:artwork:exhibition:${paginationDto}`;
    const cached = await this.cacheService.get<PaginationResponseDto<ExhibitionListItemDto>>(cacheKey);
    if (cached) return cached;


    //console.log('aaaaaaaaaaaaaaaa================');
    const query = this.exhibitionRepo.createQueryBuilder('exhibition')
      .where('exhibition.status = :status', { status: true })
      .orderBy('exhibition.dateStart', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    const response = new PaginationResponseDto(
      plainToInstance(ExhibitionListItemDto, items),
      { total, page, limit }
    );

    await this.cacheService.set(cacheKey, response);
    return response;
  }

  async getExhibitionArtistsWithProductCount(exhibitionId: number) {
    const cacheKey = `frontend:artwork:exhibition:ProductCount:${exhibitionId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await this.exhibitionRepo
      .createQueryBuilder('exhibition')
      .innerJoin('exhibition.exhibitionProducts', 'exhibitionProduct')
      .innerJoin('exhibitionProduct.product', 'product')
      .innerJoin('product.artist', 'artist') // product belongs to artist
      .innerJoin('artist.roles', 'roles') // artist must have role
      .where('exhibition.id = :exhibitionId', { exhibitionId })
      .andWhere('roles.id = :roleId', { roleId: 13 }) // 13 = Artist role
      .select('exhibition.id', 'exhibitionId')
      .addSelect('artist.id', 'artistId')
      .addSelect('artist.username', 'artistName')
      .addSelect('COUNT(product.id)', 'productCount')
      .groupBy('exhibition.id')
      .addGroupBy('artist.id')
      .getRawMany();
    await this.cacheService.set(cacheKey, result);
    return result;
  }


  async nextonlineExhi(id: number) {

    const cacheKey = `frontend:artwork:exhibition:next:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;


    const exhibition = await this.exhibitionRepo
      .createQueryBuilder('exhibition')
      .leftJoin('exhibition.displayMappings', 'exhprod')
      .leftJoin('exhprod.product', 'product')
      .leftJoin('product.artist', 'artist')
      .leftJoin('artist.profileImage', 'proimg')
      .where('exhibition.id = :exhibitionId', { exhibitionId: id })
      .select([
        'exhibition.id AS exhibition_id',
        'exhibition.ExibitionTitle AS exhibition_title',
        'exhibition.description AS exhibition_description',
        'exhibition.imageURL AS exhibition_imgurl',
        'exhibition.dateStart AS exhibition_startDate',
        'exhibition.dateEnd AS exhibition_endDate',
        'artist.id AS artist_id',
        'artist.username AS artist_username',
        'proimg.imageUrl AS artist_img',
      ])
      .groupBy('exhibition.id')
      .addGroupBy('artist.id')
      .getRawMany();

    if (!exhibition.length) throw new NotFoundException('Exhibition not found');

    // ✅ Now destructuring works correctly
    const {
      exhibition_id,
      exhibition_title,
      exhibition_description,
      exhibition_imgurl,
      exhibition_startDate,
      exhibition_endDate,
    } = exhibition[0];

    const result = {
      id: exhibition_id,
      title: exhibition_title,
      desc: exhibition_description,
      imgurl: exhibition_imgurl,
      startDate: exhibition_startDate,
      endDate: exhibition_endDate,
      artists: exhibition.map((e) => ({
        id: e.artist_id,
        username: e.artist_username,
        img: e.artist_img,
      })),
    };
    await this.cacheService.set(cacheKey, result);

    return result;
  }


  async findOnePublic(id: number): Promise<ExhibitionDetailDto> {
    const cacheKey = `frontend:artwork:exhibition:${id}`;
    const cached = await this.cacheService.get<ExhibitionDetailDto>(cacheKey);
    if (cached) return cached;

    const exhibition = await this.exhibitionRepo.findOne({
      where: { id, status: true },
      relations: [
        'displayMappings',
        'displayMappings.product',
        'displayMappings.product.category',
        'displayMappings.product.artist',
        'displayMappings.product.medium',
        'displayMappings.product.surface',
        'displayMappings.product.artist.profileImage'
      ],
    });

    if (!exhibition) throw new NotFoundException('Exhibition not found');

    const dto = plainToInstance(ExhibitionDetailDto, exhibition);
    dto.displayMappings = exhibition.displayMappings.map(mapping =>
      plainToInstance(ProductListItemDto, mapping.product, { excludeExtraneousValues: true }),
    );

    await this.cacheService.set(cacheKey, dto);
    return dto;
  }

  // ✅ Get currently live exhibitions
  // ✅ Get currently live exhibitions (returns array)
  async findLiveExhibitions(currency?: string): Promise<ExhibitionDetailDtos[]> {
    const cacheKey = 'frontend:exhibitions:live';
    const cached = await this.cacheService.get<ExhibitionDetailDtos[]>(cacheKey);
    //if (cached) return cached;

    const now = new Date();
    const exhibitions = await this.exhibitionRepo.find({
      where: {
        status: true,
        dateStart: LessThanOrEqual(now),
        dateEnd: MoreThanOrEqual(now),
      },
      order: { dateStart: 'ASC' },
      relations: [
        'displayMappings',
        'displayMappings.product',
        'displayMappings.product.productInventory',
        'displayMappings.product.category',
        'displayMappings.product.artist',
        'displayMappings.product.medium',
        'displayMappings.product.surface',
        'displayMappings.product.artist.profileImage'
      ],
    });
    // console.log('-----------------------',JSON.stringify(exhibitions)); 
    //process.exit();
    // ✅ Return empty array instead of throwing error
    if (!exhibitions.length) {
      return [];
    }
    const rate = await this.getExhCurrencyRate(currency);

    const dtos = exhibitions.map(exhibition => {
      const dto = plainToInstance(ExhibitionDetailDtos, exhibition);

      dto.displayMappings = exhibition.displayMappings.map(mapping => {
        const basePrice = mapping.product.productInventory?.price ?? 0;
        const discount = mapping.product.productInventory?.discount ?? 0;
        const gst = mapping.product.productInventory?.gstSlot ?? 0;

        // 🧮 Final discounted and GST-applied price
        const finalDiscount = basePrice - (basePrice * (discount / 100));
        const finalINR = finalDiscount + (finalDiscount * (gst / 100));
        const discountAmount = basePrice + (basePrice * (gst / 100));

        // 🪙 Currency conversion
        const displayPrice = Number((finalINR / rate).toFixed(2));
        const finalDiscountAmount = Number((discountAmount / rate).toFixed(2));
        // ✅ Merge calculated fields into product DTO
        const productDto = plainToInstance(ExhiProductListItemDto,
          {
            ...mapping.product,
            // basePrice,               // added
            displayPrice,            // added
            finalDiscountAmount,     // added
            currency: currency || 'INR',


          },

          { excludeExtraneousValues: true },
        );
        return productDto;
      });
      return dto;
    });
    // await this.cacheService.set(cacheKey, dtos);
    return dtos;
  }

  async getExhCurrencyRate(code?: string): Promise<number> {
    const currencyCode = code ?? 'INR'; // fallback if undefined
    const rate = await this.currencyRepo.findOne({
      where: { currency: currencyCode, status: true },
    });
    return rate?.value ?? 1;
  }

}
