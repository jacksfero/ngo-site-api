import { Injectable,Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventProductDto } from './dto/create-invent-product.dto';
import { UpdateInventProductDto } from './dto/update-invent-product.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { InventProdPaginatDto } from './dto/invent-product-paginate.dto';
import { InventProdListArtistDto, InventProdListDto, InventProdListSiteMapDto } from './dto/invent-prod-list.dto';
import { InventProductDetailResponseDto } from './dto/invent-product-detail-response.dto';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { CacheService } from 'src/core/cache/cache.service';
import { Currency } from 'src/shared/entities/currency.entity';


@Injectable()
export class InventProductService {
private readonly logger = new Logger(CacheService.name);
  constructor(
    private cacheService: CacheService,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

     @InjectRepository(Currency)
    private readonly currencyRepos: Repository<Currency>,

  ) {}
 
// product.service.ts (excerpt)
async findAll_new(
  paginationDto: InventProdPaginatDto,
): Promise<PaginationResponseDto<InventProdListDto>> {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    artistId,
    styleId,
    subjectId,
    orientationId,
    sizeId,
    mediumId,
    surfaceId,
    affordable_art,
    eliteChoice,
    new_arrival,
    discount,
    minPrice,
    maxPrice,
    sortPrice,
    currency,
  } = paginationDto;

  const skip = (page - 1) * limit;

  // normalize search
  const searchTerm = search?.trim();

  // cache key (stringified in predictable order)
  const cacheKey = `frontend:Artwork:All:${page}:${limit}:${searchTerm || ''}:${JSON.stringify({
    categoryId, artistId, styleId, subjectId, orientationId, sizeId, mediumId, surfaceId,
    affordable_art, eliteChoice, new_arrival, discount, minPrice, maxPrice, sortPrice, currency
  })}`;

  const cached = await this.cacheService.get<PaginationResponseDto<InventProdListDto>>(cacheKey);
  if (cached) return cached;

  // get currency rate once
  const rate = Number((await this.getCurrencyRate(currency)) || 1);

  // Base query: inventory primary table, join minimal columns only
  const qb = this.inventoryRepo.createQueryBuilder('inventory')
    // join only required product fields (avoid heavy eager loads)
    .leftJoin('inventory.product', 'product')
    .leftJoin('product.artist', 'artist')
    .leftJoin('product.category', 'category')
    // join shipping for shipping.costINR
    .leftJoin('inventory.shippingWeight', 'shipping')
    // join tags/subjects/styles only when used as filters or when needed for results
    .leftJoin('product.tags', 'tag')
    .leftJoin('product.subjects', 'subject')
    .leftJoin('product.styles', 'style')
    // base conditions
    .where('inventory.quantity > 0')
    .andWhere('inventory.status = TRUE')
    .andWhere('product.is_active = :active', { active: ProductStatus.ACTIVE });

  // ---------- Filters ----------
  if (searchTerm) {
    qb.andWhere(
      `(product.productTitle LIKE :search OR artist.username LIKE :search OR tag.name LIKE :search)`,
      { search: `%${searchTerm}%` },
    );
  }

  if (categoryId) qb.andWhere('product.category_id = :categoryId', { categoryId });
  if (artistId) qb.andWhere('product.artist_id = :artistId', { artistId });

  if (orientationId) qb.andWhere('product.orientation_id = :orientationId', { orientationId });
  if (surfaceId) qb.andWhere('product.surface_id = :surfaceId', { surfaceId });
  if (mediumId) qb.andWhere('product.medium_id = :mediumId', { mediumId });
  if (sizeId) qb.andWhere('product.size_id = :sizeId', { sizeId });

  if (subjectId) qb.andWhere('subject.id = :subjectId', { subjectId });
  if (styleId) qb.andWhere('style.id = :styleId', { styleId });

  if (new_arrival) qb.andWhere('product.new_arrival = TRUE');
  if (eliteChoice) qb.andWhere('product.eliteChoice = TRUE');
  if (affordable_art) qb.andWhere('product.affordable_art = TRUE');
  if (discount === 1) qb.andWhere('inventory.discount > 0');

  // ---------- Compute displayPrice IN SQL (finalINR / :rate) ----------
  // finaldiscount = (price * (1 - discount/100))
  // finalINR = finaldiscount + finaldiscount * (gstSlot/100) + IFNULL(shipping.costINR, 0)
  // displayPrice = finalINR / :rate
  const displayPriceExpr = `(
    (
      (inventory.price * (1 - COALESCE(inventory.discount, 0) / 100))
      + ((inventory.price * (1 - COALESCE(inventory.discount, 0) / 100)) * (COALESCE(inventory.gstSlot, 0) / 100))
      + COALESCE(shipping.costINR, 0)
    ) / :rate
  )`;

  qb.addSelect(displayPriceExpr, 'displayPrice')
    .setParameter('rate', rate);

  // ---------- Apply SQL price filters (if provided) ----------
  if (minPrice !== undefined) qb.andWhere(`${displayPriceExpr} >= :minPrice`, { minPrice, rate });
  if (maxPrice !== undefined) qb.andWhere(`${displayPriceExpr} <= :maxPrice`, { maxPrice, rate });

  // ---------- DISTINCT inventory IDs to avoid duplicates when joining tags/subjects/styles ----------
  qb.select([
    'DISTINCT inventory.id AS inventory_id',
    'inventory.price AS inventory_price',
    'inventory.discount AS inventory_discount',
    'inventory.gstSlot AS inventory_gstSlot',
    'inventory.quantity AS inventory_quantity',
    'inventory.id',
    'product.id',
    'product.productTitle',
    'product.slug',
    'product.defaultImage',
    'artist.id',
    'artist.username',
    'category.id',
    'category.name',
  ]);

  // ---------- Sorting ----------
  if (sortPrice === 'low') {
    qb.orderBy('inventory.displayPriceExpr', 'ASC');
  } else if (sortPrice === 'high') {
    qb.orderBy('inventory.displayPriceExpr', 'DESC');
  } else {
    qb.orderBy('inventory.id', 'DESC');
  }

  // ---------- Count (optimized): use clone with COUNT DISTINCT ----------
  const countQb = qb.clone().select('COUNT(DISTINCT inventory.id)', 'cnt');
  const rawCount = await countQb.getRawOne();
  const total = Number(rawCount?.cnt || 0);

  // ---------- Pagination: use distinct ids subquery to get page ids, then load full entities ----------
  // get inventory ids for page
  const idsQb = qb.clone()
    .select('DISTINCT inventory.id', 'id')
    .skip(skip)
    .take(limit);

  const rawIds = await idsQb.getRawMany();
  const ids = rawIds.map(r => r.id);
  let inventories: Inventory[] = [];
  if (ids.length > 0) {
    // fetch full inventory rows with necessary joins but limited to page ids
    inventories = await this.inventoryRepo.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.artist', 'artist')
      .leftJoinAndSelect('product.category', 'category')
     // .leftJoinAndSelect('product.defaultImage', 'defaultImage') // if you have relation; else omit
      .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
      .whereInIds(ids)
      .orderBy(`FIELD(inventory.id, ${ids.join(',')})`) // maintain page order
      .getMany();
  }

  // ---------- Post-process: compute displayPrice for each inventory item (rounded) ----------
  const items = inventories.map((inventory) => {
    const base = Number(inventory.price || 0);
    const disc = Number(inventory.discount || 0);
    const gst = Number(inventory.gstSlot || 0);
    const ship = Number(inventory.shippingWeight?.costINR || 0);

    const discounted = base * (1 - (disc / 100));
    const finalINR = discounted + (discounted * (gst / 100)) + ship;
    const displayPrice = Number((finalINR / rate).toFixed(2));

    return {
      ...inventory,
      displayPrice,
      currency: currency || 'INR',
    };
  });

  // ---------- Final pagination response ----------
  const data = plainToInstance(InventProdListDto, items, { excludeExtraneousValues: true });
  const response = new PaginationResponseDto<InventProdListDto>(data, { total, page, limit });

  // Cache response (TTL as you prefer)
  await this.cacheService.set(cacheKey, response, { ttl: 300 });

  return response;
}
async findAllSiteMap(): Promise<InventProdListSiteMapDto[]> {
  const cacheKey = 'frontend:sitemap:products';

  try {
    const cached = await this.cacheService.get<InventProdListSiteMapDto[]>(cacheKey);
    if (cached) return cached;

    const inventories = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .select([
        'inventory.id',
        'product.id',
        'product.slug',
        'product.updatedAt',
      ])
      .where('inventory.quantity > 0')
      .andWhere('inventory.status = true')
      .andWhere('product.is_active = :isActive', {
        isActive: ProductStatus.ACTIVE,
      })
      .getMany();

    const response: InventProdListSiteMapDto[] = inventories.map((inv) => ({
      id: inv.id,
      product: inv.product
        ? {
            id: inv.product.id,
            slug: inv.product.slug,
            updatedAt: inv.product.updatedAt.toISOString(),
          }
        : undefined,
    }));

    await this.cacheService.set(cacheKey, response, { ttl: 3600 }); // ✅ 1 hour TTL
    return response;

  } catch (error) {
    this.logger.error(
      `Error in findAllSiteMap: ${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException('Failed to fetch sitemap products');
  }
}

async findAll(
  paginationDto: InventProdPaginatDto,
): Promise<PaginationResponseDto<InventProdListDto>> {
  try {
    const {
      page,
      limit,
      search,
      categoryId,
      artistId,
      styleId,
      subjectId,
      orientationId,
      sizeId,
      mediumId,
      surfaceId,
      affordable_art,
      eliteChoice,
      new_arrival,
      discount,
      minPrice,
      maxPrice,
      sortPrice,
      currency,
      random,
    } = paginationDto;

    const skip = (page - 1) * limit;
    const searchTerm = search?.trim();
    
    const cacheKey = `frontend:Artwork:All:${page}:${limit}:${searchTerm || ''}:${JSON.stringify({
      categoryId, artistId, styleId, subjectId, orientationId, sizeId, mediumId, surfaceId,
      affordable_art, eliteChoice, new_arrival, discount, minPrice, maxPrice, sortPrice, currency,random
    })}`;

    const cached = await this.cacheService.get<PaginationResponseDto<InventProdListDto>>(cacheKey);
    if (cached) return cached;

    // ✅ Main query builder
    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .select([
        'inventory.id',
        'inventory.price',
        'inventory.discount',
        'inventory.gstSlot',
        'inventory.quantity',
        'inventory.status',
        'product.id',
        'product.productTitle',
        'product.slug',
        'product.defaultImage','product.price_on_demand','product.weight',
         'product.width','product.height','product.depth',
        
        'product.is_active',
        'artist.id',
        'artist.username',
        'category.id',
        'category.name',
        'shipping.id',
        'shipping.costINR',
        'surface.id',
        'surface.surfaceName',
        'medium.id','subject.id','subject.subject','subject.description',
        'medium.name','style.id','style.title','style.description',
      ])
      .leftJoin('inventory.product', 'product')
      .leftJoin('product.artist', 'artist')
      .leftJoin('product.category', 'category')
      .leftJoin('product.tags', 'tag')
      .leftJoin('product.subjects', 'subject')
      .leftJoin('product.styles', 'style')
        .leftJoin('product.surface', 'surface')
     .leftJoin('product.medium', 'medium')
      .leftJoin('inventory.shippingWeight', 'shipping')
      .where("inventory.quantity > :quantity", { quantity: 0 })
      .andWhere('inventory.status = :status', { status: true })
      .andWhere('product.is_active = :isActive', { isActive: ProductStatus.ACTIVE });

    // ✅ Search filter
    if (searchTerm) {
      qb.andWhere(
        `(product.productTitle LIKE :search OR artist.username LIKE :search OR tag.name LIKE :search)`,
        { search: `%${searchTerm}%` },
      );
    }

    // ✅ Apply filters
    const filters = [
      { field: 'orientation_id', value: orientationId },
      { field: 'surface_id', value: surfaceId },
      { field: 'medium_id', value: mediumId },
      { field: 'size_id', value: sizeId },
      { field: 'category_id', value: categoryId },
      { field: 'artist_id', value: artistId },
    ];

    filters.forEach(({ field, value }) => {
      if (value) qb.andWhere(`product.${field} = :${field}`, { [field]: value });
    });

    if (subjectId) qb.andWhere('subject.id = :subjectId', { subjectId });
    if (styleId) qb.andWhere('style.id = :styleId', { styleId });
    if (new_arrival) qb.andWhere('product.new_arrival = :new_arrival', { new_arrival });
    if (eliteChoice) qb.andWhere('product.eliteChoice = :eliteChoice', { eliteChoice });
    if (affordable_art) qb.andWhere('product.affordable_art = :affordable_art', { affordable_art });
    if (discount === 1) qb.andWhere('inventory.discount > 0');


 const priceFormula = `
      (
        (
          inventory.price * (1 - IFNULL(inventory.discount, 0) / 100)
        ) * (1 + IFNULL(inventory.gstSlot, 0) / 100)
        + IFNULL(shipping.costINR, 0)
      )
    `;

    qb.addSelect(priceFormula, 'displayPriceINR');


   // ✅ Price Filtering (Correct)
    if (minPrice !== undefined && maxPrice !== undefined) {
      qb.andWhere(`${priceFormula} BETWEEN :minPrice AND :maxPrice`, {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      qb.andWhere(`${priceFormula} >= :minPrice`, { minPrice });
    } else if (maxPrice !== undefined) {
      qb.andWhere(`${priceFormula} <= :maxPrice`, { maxPrice });
    }
     // ✅ Total Count (CLONE BEFORE ORDER BY)
    const total = await qb.clone().getCount();
  // ✅ Sorting
  if (random) {
      // Use RANDOM() for Postgres or RAND() for MySQL
      qb.orderBy('RAND()'); 
    }
   else if (sortPrice === 'low') {
      qb.orderBy('displayPriceINR', 'ASC');
    } else if (sortPrice === 'high') {
      qb.orderBy('displayPriceINR', 'DESC');
    } else {
      qb.orderBy('inventory.id', 'DESC');
    }
   // ✅ Pagination
    const inventories = await qb.skip(skip).take(limit).getMany();

     // ✅ Currency Conversion
    const rate = await this.getCurrencyRate(currency);

   const computed = inventories.map((inventory) => {
      const basePrice = Number(inventory.price || 0);
      const gst = Number(inventory.gstSlot || 0);
      const disc = Number(inventory.discount || 0);
      const shippingCost = Number(inventory.shippingWeight?.costINR || 0);

      const priceAfterDiscount = basePrice * (1 - disc / 100);
      const priceWithGST = priceAfterDiscount * (1 + gst / 100);
      const finalINR = priceWithGST + shippingCost;

      const displayPrice = Number((finalINR / rate).toFixed(2));
      const originalPrice =
        (basePrice * (1 + gst / 100) + shippingCost) / rate;
  return {
        ...inventory,
        displayPrice,
        finaldiscountamount: Number(originalPrice.toFixed(2)),
        currency: currency || 'INR',
      };
    });

    const data = plainToInstance(InventProdListDto, computed, {
      excludeExtraneousValues: true,
    });

    const response = new PaginationResponseDto<InventProdListDto>(data, {
      total,
      page,
      limit,
    });

    await this.cacheService.set(cacheKey, response);
    return response;
  } catch (error) {
    this.logger.error(`Error in findAll: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Failed to fetch products');
  }
}
 
async getArtworkByArtist(
  paginationDto: InventProdPaginatDto,
): Promise<PaginationResponseDto<InventProdListArtistDto>> {
  try {
    const {
      page,
      limit,
      search,
      categoryId,
      artistId,
      styleId,
      subjectId,
      orientationId,
      sizeId,
      mediumId,
      surfaceId,
      affordable_art,
      eliteChoice,
      new_arrival,
      discount,
      minPrice,
      maxPrice,
      sortPrice,
      currency,
    } = paginationDto;

    const skip = (page - 1) * limit;
    const searchTerm = search?.trim();
    
    const cacheKey = `frontend:Artwork:All:${page}:${limit}:${searchTerm || ''}:${JSON.stringify({
      categoryId, artistId, styleId, subjectId, orientationId, sizeId, mediumId, surfaceId,
      affordable_art, eliteChoice, new_arrival, discount, minPrice, maxPrice, sortPrice, currency
    })}`;

    const cached = await this.cacheService.get<PaginationResponseDto<InventProdListDto>>(cacheKey);
    if (cached) return cached;

    // ✅ Main query builder
    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .select([
        'inventory.id',
        'inventory.price',
        'inventory.discount',
        'inventory.gstSlot',
        'inventory.quantity',
        'inventory.status',
        'product.id',
        'product.productTitle',
        'product.slug',
        'product.defaultImage','product.price_on_demand','product.weight',
         'product.width','product.height','product.depth',        
        'product.is_active',
        'artist.id',
        'artist.username',
        'category.id',
        'category.name',
        'shipping.id',
        'shipping.costINR',
        'surface.id',
        'surface.surfaceName',
        'medium.id',
        //'subject.id','subject.subject','subject.description',
        'medium.name',
        //'style.id','style.title','style.description',
      ])
      .leftJoin('inventory.product', 'product')
      .leftJoin('product.artist', 'artist')
      .leftJoin('product.category', 'category')
      .leftJoin('product.tags', 'tag')
     // .leftJoin('product.subjects', 'subject')
     // .leftJoin('product.styles', 'style')
        .leftJoin('product.surface', 'surface')
     .leftJoin('product.medium', 'medium')
      .leftJoin('inventory.shippingWeight', 'shipping')
      .where("inventory.quantity > :quantity", { quantity: 0 })
      .andWhere('inventory.status = :status', { status: true })
      .andWhere('product.is_active = :isActive', { isActive: ProductStatus.ACTIVE });

    // ✅ Search filter
    if (searchTerm) {
      qb.andWhere(
        `(product.productTitle LIKE :search OR artist.username LIKE :search OR tag.name LIKE :search)`,
        { search: `%${searchTerm}%` },
      );
    }

    // ✅ Apply filters
    const filters = [
      { field: 'orientation_id', value: orientationId },
      { field: 'surface_id', value: surfaceId },
      { field: 'medium_id', value: mediumId },
      { field: 'size_id', value: sizeId },
      { field: 'category_id', value: categoryId },
      { field: 'artist_id', value: artistId },
    ];

    filters.forEach(({ field, value }) => {
      if (value) qb.andWhere(`product.${field} = :${field}`, { [field]: value });
    });

    //if (subjectId) qb.andWhere('subject.id = :subjectId', { subjectId });
   // if (styleId) qb.andWhere('style.id = :styleId', { styleId });
    if (new_arrival) qb.andWhere('product.new_arrival = :new_arrival', { new_arrival });
    if (eliteChoice) qb.andWhere('product.eliteChoice = :eliteChoice', { eliteChoice });
    if (affordable_art) qb.andWhere('product.affordable_art = :affordable_art', { affordable_art });
    if (discount === 1) qb.andWhere('inventory.discount > 0');

    // ✅ Price filtering at database level (use base price)
    if (minPrice !== undefined && maxPrice !== undefined) {
      qb.andWhere('inventory.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      qb.andWhere('inventory.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      qb.andWhere('inventory.price <= :maxPrice', { maxPrice });
    }

    // ✅ Sorting at database level
    if (sortPrice === 'low') {
      qb.orderBy('inventory.price', 'ASC');
    } else if (sortPrice === 'high') {
      qb.orderBy('inventory.price', 'DESC');
    } else {
      qb.orderBy('inventory.id', 'DESC');
    }

    // ✅ Get total count
    const total = await qb.getCount();

    // ✅ Get paginated results
    const inventories = await qb
      .skip(skip)
      .take(limit)
      .getMany();

    // ✅ Currency conversion
    const rate = await this.getCurrencyRate(currency);

    // ✅ Compute prices with proper logic
    const computed = inventories.map((inventory) => {
      const basePrice = Number(inventory.price || 0);
      const gst = Number(inventory.gstSlot || 0);
      const discount = Number(inventory.discount || 0);
      const shipping = Number(inventory.shippingWeight?.costINR || 0);

      // Calculate price after discount
      const priceAfterDiscount = basePrice * (1 - discount / 100);
      
      // Add GST to discounted price
      const priceWithGST = priceAfterDiscount * (1 + gst / 100);
      
      // Add shipping
      const finalINR = priceWithGST + shipping;
      
      // Convert to target currency
      const displayPrice = Number((finalINR / rate).toFixed(2));
      
      // Calculate original price for discount display
      const originalPriceWithGST = (basePrice * (1 + gst / 100)) + shipping;
      const finaldiscountamount = Number((originalPriceWithGST / rate).toFixed(2));

      return {
        ...inventory,
        finaldiscountamount,
        displayPrice,
        currency: currency || 'INR',
      };
    });

    // ✅ Transform to DTO
    const data = plainToInstance(InventProdListDto, computed, {
      excludeExtraneousValues: true,
    });

    const response = new PaginationResponseDto<InventProdListDto>(data, {
      total,
      page,
      limit,
    });

    await this.cacheService.set(cacheKey, response); // Add TTL
    return response;

  } catch (error) {
    this.logger.error(`Error in findAll: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Failed to fetch products');
  }
}
 
 

  async findAll_bk(
    paginationDto: InventProdPaginatDto,
  ): Promise<PaginationResponseDto<InventProdListDto>> {
    // let categoryId?:number ;

    const { page, limit, search,isActive, categoryId, artistId,select, 
      styleId, subjectId, orientationId, sizeId,mediumId,surfaceId,
      affordable_art,eliteChoice,new_arrival,discount,minPrice,
    maxPrice, sortPrice,currency   } = paginationDto;
    
    const skip = (page - 1) * limit;

     const cacheKey = `frontend:Artwork:All:${JSON.stringify(paginationDto)}`;
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached as PaginationResponseDto<InventProdListDto>;

    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.surface', 'surface')
    .leftJoinAndSelect('product.medium', 'medium')
    .leftJoinAndSelect('product.tags', 'tag')
    .leftJoinAndSelect('product.subjects', 'subject') // manytomany
     .leftJoinAndSelect('product.styles', 'style')
    .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
    .where('inventory.status = :status', { status:true })
    //.andWhere('product.is_active = :isActive', { isActive: "Active" });
    .andWhere('product.is_active = :isActive', { isActive:  ProductStatus.ACTIVE })

      // ✅ OPTIONAL: Only join many-to-many relations if they're needed for filtering
    // ✅ Add optional joins
 // if (subjectId) qb.leftJoinAndSelect('product.subjects', 'subject');
//  if (styleId) qb.leftJoinAndSelect('product.styles', 'style');

  // ✅ Search filter
  if (search) {
    qb.andWhere(`
      product.productTitle LIKE :search 
      OR tag.name LIKE :search 
      OR artist.username LIKE :search
    `, { search: `%${search}%` });
  }
   // ✅ Various filters
    if (orientationId) {
       qb.andWhere('product.orientation_id = :orientationId', { orientationId });
    }
    if (surfaceId) {
      qb.andWhere('product.surface_id = :surfaceId', { surfaceId });
   }
   if (mediumId) {
    qb.andWhere('product.medium_id = :mediumId', { mediumId });
    }
    if (sizeId) {
      qb.andWhere('product.size_id = :sizeId', { sizeId });
    }
    // ✅ MANY-TO-MANY FILTERS (correct syntax)
  if (subjectId) {
    qb.andWhere('subject.id = :subjectId', { subjectId });
  }
  
  if (styleId) {
    qb.andWhere('style.id = :styleId', { styleId });
  }
    if (categoryId) {
    //  console.log('categoryId-22222---------',categoryId);
      qb.andWhere('product.category_id = :categoryId', { categoryId });
    }

    if (artistId) {
      qb.andWhere('product.artist_id = :artistId', { artistId });
    }
    if (new_arrival) {
      qb.andWhere('product.new_arrival = :new_arrival', { new_arrival });
     
    }
    if (eliteChoice) {
      qb.andWhere('product.eliteChoice = :eliteChoice', { eliteChoice });
    }
    if (affordable_art) {
      qb.andWhere('product.affordable_art = :affordable_art', { affordable_art });
    }
    if (discount === 1) {
      qb.andWhere('inventory.discount > 0 ');       
    }
     // ✅ PRICE RANGE FILTER
  if (minPrice && maxPrice) {
    qb.andWhere('inventory.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
  } else if (minPrice) {
    qb.andWhere('inventory.price >= :minPrice', { minPrice });
  } else if (maxPrice) {
    qb.andWhere('inventory.price <= :maxPrice', { maxPrice });
  }
   // ✅ PRICE SORTING
  if (sortPrice === 'low') {
  //  qb.orderBy('inventory.price', 'ASC');
  } else if (sortPrice === 'high') {
    //qb.orderBy('inventory.price', 'DESC');
  } else {
    qb.orderBy('inventory.updatedAt', 'DESC'); // default sort (latest)
  }
  
 // ✅ Define default fields (always selected)
 const defaultInventoryFields = ['id', 'status', 'price', 'discount','gstSlot','shippingSlot','updatedAt'];
 const defaultProductFields = ['id', 'productTitle','price_on_demand','is_active','depth','height','width','weight','slug', 'defaultImage'];
 const defaultArtistFields = ['id', 'username'];
 const defaultCategoryFields = ['id', 'name'];
 const defaultSurfaceFields = ['id', 'surfaceName'];
 const defaultStyleFields = ['id', 'title', 'description'];
 const defaultSubjectFields = ['id', 'subject', 'description'];
 const defaultMediumFields = ['id', 'name'];
 const defaultShippingFields = ['weightSlot', 'costINR', 'CostOthers'];

 // ✅ Process requested fields
 let selectedFields: string[] = [];
    // ✅ Select only requested fields
    // ✅ Select only requested fields
    if (select) {
      const requestedFields = select.split(',').map((f) => f.trim());
      
      // Filter valid inventory fields
      const validRequestedFields = requestedFields.filter(field => 
        this.inventoryRepo.metadata.propertiesMap.hasOwnProperty(field)
      );
      
      selectedFields = [...defaultInventoryFields, ...validRequestedFields];
    } else {
      // If no select parameter, use all default fields
      selectedFields = defaultInventoryFields;
    }
  
    // ✅ Always select the default relation fields
    qb.select([
      // Inventory fields
      ...selectedFields.map(field => `inventory.${field}`),
      
      // Default product fields (always included)
      ...defaultProductFields.map(field => `product.${field}`),
      
      // Default artist fields (always included)
      ...defaultCategoryFields.map(field => `category.${field}`),

        ...defaultStyleFields.map(field => `style.${field}`),

         ...defaultSubjectFields.map(field => `subject.${field}`),

      // Default artist fields (always included)
      ...defaultArtistFields.map(field => `artist.${field}`),

       // Default artist fields (always included)
       ...defaultSurfaceFields.map(field => `surface.${field}`),

        // Default artist fields (always included)
      ...defaultMediumFields.map(field => `medium.${field}`),
      
      // Default shipping fields (always included)
      ...defaultShippingFields.map(field => `shipping.${field}`),
    ]);
   // console.log('------aaaaaa---=======---------')
   //// process.exit();
  
    // ✅ Pagination
    //qb.skip((page - 1) * limit).take(limit);
  
    const [result, total] = await qb.take(limit).skip(skip).getManyAndCount();

    // ✅ Step 3: Compute display price dynamically (Option 1)
    const conversionRates = { INR: 1, USD: 0.067, EUR: 0.061 };
    const rate = conversionRates[paginationDto.currency || 'INR'];

    const computed = result.map((inventory) => {
  const basePrice = Number(inventory.price || 0);
  const gst = Number(inventory.gstSlot || 0); // optional
  const discount = Number(inventory.discount || 0);
  const shipping = inventory.shippingWeight?.costINR || 0;

   // Example: apply GST, shipping, and discount
  const finalINR = basePrice + gst + shipping - discount;
  const displayPrice = Number((finalINR * rate).toFixed(2));
 });


 // ✅ Step 4: Sort by display price if requested
let sortedData = computed;  
/*
if (sortPrice === 'low') {
  sortedData = computed.sort((a, b) => a.displayPrice - b.displayPrice);
} else if (sortPrice === 'high') {
  sortedData = computed.sort((a, b) => b.displayPrice - a.displayPrice);
}*/

const paginatedData = sortedData.slice(skip, skip + limit);


    // const data = plainToInstance(InventProdListDto, result, {
    //   excludeExtraneousValues: true,
    // });
    const data = plainToInstance(InventProdListDto, paginatedData, {
  excludeExtraneousValues: true,
});
    
  
   // return new PaginationResponseDto<InventProdListDto>(data, { total, page, limit  });
  const response = new PaginationResponseDto<InventProdListDto>(data, { total, page, limit  });
    
    await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  // console.log('✅ Cache miss:', cacheKey);
  return response;
  }

 // inventory.service.ts
 async findOne(productSlug: string,
currency?: string,  

 ): Promise<InventProductDetailResponseDto> {

    const cacheKey = `frontend:artworkdetail:active:${productSlug}:${currency || 'INR'}`;

       // ✅ 1. Try cache first
     const cached = await this.cacheService.get<InventProductDetailResponseDto>(cacheKey);
    if (cached  ) {
      return cached;
    } // ✅ 2. Fetch from DB if not cached

  const inventory = await this.inventoryRepo
  .createQueryBuilder('inventory')
    .innerJoinAndSelect('inventory.product', 'product') // Changed to innerJoinAndSelect
    .leftJoinAndSelect('product.artist', 'artist')
    .leftJoinAndSelect('product.surface', 'surface')
    .leftJoinAndSelect('product.medium', 'medium')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.images', 'images')
   // .leftJoinAndSelect('product.orientation', 'orientation') // Added orientation
    .leftJoinAndSelect('product.size', 'size') // Added size
    .leftJoinAndSelect('product.packingMode', 'packingMode') // Added size
    .leftJoinAndSelect('inventory.shippingWeight', 'shippingWeight') // Uncommented shipping
    .where('product.slug = :productSlug', { productSlug }) // Better parameter name
    .andWhere('inventory.status = :status', { status: true })
    .andWhere('product.is_active IN (:...statuses)', { 
      statuses: [ProductStatus.ACTIVE, ProductStatus.SOLD_OUT, ProductStatus.SOLD_BY_ARTIST] 
    })
    // ✅ CRITICAL: Add inventory quantity check for e-commerce
    //.andWhere('inventory.quantity > :minQuantity', { minQuantity: 0 })
    .select([
      // ✅ Product fields
      'product.id','product.created_in','product.original_painting',
      'product.productTitle','product.slug', 'product.negotiable','product.refundable',
      'product.description', 'product.certificate', 'product.conditions',
      'product.price_on_demand','product.defaultImage','product.printing_rights',
      'product.width','product.height','product.depth',
      'product.weight', 'product.is_active',
 
      // ✅ Category fields
      'category.id',
      'category.name',

      // ✅ Artist fields
      'artist.id',
      'artist.username',
       
      // ✅ Images fields
      'images.id',
      'images.imagePath',
       
   // ✅ Size fields
      'size.id',
      'size.name',

      // ✅ Surface fields
      'surface.id',
      'surface.surfaceName',

      // ✅ Medium fields
      'medium.id',
      'medium.name',
      
      // ✅ Packing mode fields
      'packingMode.id',
      'packingMode.name',

      // ✅ Inventory fields
      'inventory.id',
      'inventory.discount',
      'inventory.price','inventory.termsAndConditions',
      'inventory.gstSlot',
      'inventory.shippingSlot',
      

   /*   // ✅ Shipping weight (if entity has fields)
      'shippingWeight.id',
      'shippingWeight.weight',
      'shippingWeight.unit',*/
    ])
    .getOne();

    if (!inventory) {
      throw new NotFoundException(`Artwork with Title "${productSlug}" not found or out of stock`);
    }

//const rate = conversionRates[currency || 'INR'];
const rate = await this.getCurrencyRate(currency);

 
  // ✅ 4. Compute display and discount values
  const basePrice = inventory.price ?? 0;
  const discount = inventory.discount ?? 0;
  const gst = inventory.gstSlot ?? 0;

  // final discounted amount
 const finaldiscount = basePrice  - (basePrice*(discount/100));
   const finalINR = (finaldiscount  + (finaldiscount*(gst/100)));
  const  discountamount = (basePrice  + (basePrice*(gst/100)));
 const finaldiscountamount = Number((discountamount / rate).toFixed(2));
  const displayPrice = Number((finalINR / rate).toFixed(2));

  

  const response = plainToInstance(
    InventProductDetailResponseDto,
    {
      ...inventory.product,
      inventories: [ 
        {
          ...inventory,
    displayPrice,
    finaldiscountamount,
    currency: currency || 'INR',

        }

      ],
    },
    { excludeExtraneousValues: true },
  );

 await this.cacheService.set(cacheKey, response);
  // console.log('✅ Cache miss:', cacheKey);
  return response;
}

async soldArtworkByArtist(
  paginationDto: InventProdPaginatDto,
): Promise<PaginationResponseDto<InventProdListDto>> {
  // let categoryId?:number ;

  const { page, limit, search,isActive, categoryId, artistId,select, 
    styleId, subjectId, orientationId, sizeId,mediumId,surfaceId,
    affordable_art,eliteChoice,new_arrival,discount   } = paginationDto;
  //  let categoryId?:number ;
//  console.log('cateid-----------',categoryId);
//  console.log('categoryId----------', categoryId, typeof categoryId);
//  console.log('limit-----------',limit);
//  console.log('search-----------',search);
  const skip = (page - 1) * limit;

     // 1️⃣ Generate a unique cache key
    
const cacheKey = `frontend:soldArtworkByArtist:${JSON.stringify(paginationDto)}`;
const cached = await this.cacheService.get(cacheKey);
if (cached) {
  return cached as PaginationResponseDto<InventProdListDto>;
}
  const qb = this.inventoryRepo.createQueryBuilder('inventory')
  .leftJoinAndSelect('inventory.product', 'product')
  .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
  .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.surface', 'surface')
    .leftJoinAndSelect('product.medium', 'medium')
  // .leftJoinAndSelect('product.subjects', 'subject') // manytomany
  // .leftJoinAndSelect('product.styles', 'style')
  .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
  .where('inventory.status = :status', { status:true })
  //.andWhere('product.is_active = :statuses', { statuses:  ProductStatus.SOLD_OUT })
  .andWhere('product.is_active IN (:...statuses)', { 
      statuses: [  ProductStatus.SOLD_OUT, ProductStatus.SOLD_BY_ARTIST] 
    })

    // ✅ OPTIONAL: Only join many-to-many relations if they're needed for filtering
if (subjectId) {
  qb.leftJoinAndSelect('product.subjects', 'subject');
}

if (styleId) {
  qb.leftJoinAndSelect('product.styles', 'style');
}

  if (search) {
    qb.andWhere('product.productTitle LIKE :search OR product.description LIKE :search', {
      search: `%${search}%`,
    });
  }

  if (orientationId) {
     qb.andWhere('product.orientation_id = :orientationId', { orientationId });
  }
  if (surfaceId) {
    qb.andWhere('product.surface_id = :surfaceId', { surfaceId });
 }
 if (mediumId) {
  qb.andWhere('product.medium_id = :mediumId', { mediumId });
  }
  if (sizeId) {
    qb.andWhere('product.size_id = :sizeId', { sizeId });
  }
  // ✅ MANY-TO-MANY FILTERS (correct syntax)
if (subjectId) {
  qb.andWhere('subject.id = :subjectId', { subjectId });
}

if (styleId) {
  qb.andWhere('style.id = :styleId', { styleId });
}
  if (categoryId) {
  //  console.log('categoryId-22222---------',categoryId);
    qb.andWhere('product.category_id = :categoryId', { categoryId });
  }

  if (artistId) {
    qb.andWhere('product.artist_id = :artistId', { artistId });
  }
  if (new_arrival) {
    qb.andWhere('product.new_arrival = :new_arrival', { new_arrival });
   
  }
  if (eliteChoice) {
    qb.andWhere('product.eliteChoice = :eliteChoice', { eliteChoice });
  }
  if (affordable_art) {
    qb.andWhere('product.affordable_art = :affordable_art', { affordable_art });
  }
  if (discount) {
    qb.andWhere('product.commission_type_id != 1 ');
  }

// ✅ Define default fields (always selected)
const defaultInventoryFields = ['id', 'status', 'price', 'discount','gstSlot','shippingSlot','updatedAt'];
//const defaultProductFields = ['id', 'productTitle','slug', 'defaultImage'];
const defaultProductFields = ['id', 'productTitle','is_active','price_on_demand','depth','height','width','weight','slug', 'defaultImage'];
const defaultArtistFields = ['id', 'username'];
const defaultCategoryFields = ['id', 'name'];
 const defaultSurfaceFields = ['id', 'surfaceName'];
 const defaultMediumFields = ['id', 'name'];
const defaultShippingFields = ['weightSlot', 'costINR', 'CostOthers'];

// ✅ Process requested fields
let selectedFields: string[] = [];
  // ✅ Select only requested fields
  if (select) {
    const requestedFields = select.split(',').map((f) => f.trim());
    
    // Filter valid inventory fields
    const validRequestedFields = requestedFields.filter(field => 
      this.inventoryRepo.metadata.propertiesMap.hasOwnProperty(field)
    );
    
    selectedFields = [...defaultInventoryFields, ...validRequestedFields];
  } else {
    // If no select parameter, use all default fields
    selectedFields = defaultInventoryFields;
  }

  // ✅ Always select the default relation fields
  qb.select([
    // Inventory fields
    ...selectedFields.map(field => `inventory.${field}`),
    
    // Default product fields (always included)
    ...defaultProductFields.map(field => `product.${field}`),
    
    // Default artist fields (always included)
    ...defaultCategoryFields.map(field => `category.${field}`),

    // Default artist fields (always included)
    ...defaultArtistFields.map(field => `artist.${field}`),
    
 // Default artist fields (always included)
       ...defaultSurfaceFields.map(field => `surface.${field}`),

        // Default artist fields (always included)
      ...defaultMediumFields.map(field => `medium.${field}`),

    // Default shipping fields (always included)
    ...defaultShippingFields.map(field => `shipping.${field}`),
  ]);
 // console.log('------aaaaaa---=======---------')
 //// process.exit();

  // ✅ Pagination
  //qb.skip((page - 1) * limit).take(limit);

  const [result, total] = await qb.take(limit).skip(skip).getManyAndCount();


  const data = plainToInstance(InventProdListDto, result, {
    excludeExtraneousValues: true,
  });

 // return new PaginationResponseDto<InventProdListDto>(data, { total, page, limit  }); 

   const response = new PaginationResponseDto<InventProdListDto>(data, { total, page, limit });

 
await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  // console.log('✅ Cache miss:', cacheKey);
  return response;
}
  


 async getCurrencyRate(code?: string): Promise<number> {
  const currencyCode = code ?? 'INR'; // fallback if undefined
  const rate = await this.currencyRepos.findOne({
    where: { currency: currencyCode, status: true },
  });
  return rate?.value ?? 1;
}







}



/*


GET /frontend/inventory?page=1&limit=12&search=painting&categoryId=2&artistId=5
*/
