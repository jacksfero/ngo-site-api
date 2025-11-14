import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventProductDto } from './dto/create-invent-product.dto';
import { UpdateInventProductDto } from './dto/update-invent-product.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { InventProdPaginatDto } from './dto/invent-product-paginate.dto';
import { InventProdListDto } from './dto/invent-prod-list.dto';
import { InventProductDetailResponseDto } from './dto/invent-product-detail-response.dto';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { CacheService } from 'src/core/cache/cache.service';
import { Currency } from 'src/shared/entities/currency.entity';


@Injectable()
export class InventProductService {

  constructor(
    private cacheService: CacheService,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

     @InjectRepository(Currency)
    private readonly currencyRepos: Repository<Currency>,

  ) {}
 


 
async findAll(
  paginationDto: InventProdPaginatDto,
): Promise<PaginationResponseDto<InventProdListDto>> {
  const {
    page,
    limit,
    search,
    isActive,
    categoryId,
    artistId,
    select,
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
  const cacheKey = `frontend:Artwork:All:${JSON.stringify(paginationDto)}`;
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached as PaginationResponseDto<InventProdListDto>;

  const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.surface', 'surface')
    .leftJoinAndSelect('product.medium', 'medium')
    .leftJoinAndSelect('product.tags', 'tag')
    .leftJoinAndSelect('product.subjects', 'subject')
    .leftJoinAndSelect('product.styles', 'style')
    .leftJoinAndSelect('inventory.shippingWeight', 'shipping')     
    .where("inventory.quantity > :quantity", { quantity: 0 })
    .andWhere('inventory.status = :status', { status: true })
    .andWhere('product.is_active = :isActive', { isActive: ProductStatus.ACTIVE });

  // ✅ Search
  if (search) {
    qb.andWhere(
      `(product.productTitle LIKE :search 
        OR tag.name LIKE :search 
        OR artist.username LIKE :search)`,
      { search: `%${search}%` },
    );
  }

  // ✅ Filtering
  if (orientationId) qb.andWhere('product.orientation_id = :orientationId', { orientationId });
  if (surfaceId) qb.andWhere('product.surface_id = :surfaceId', { surfaceId });
  if (mediumId) qb.andWhere('product.medium_id = :mediumId', { mediumId });
  if (sizeId) qb.andWhere('product.size_id = :sizeId', { sizeId });
  if (subjectId) qb.andWhere('subject.id = :subjectId', { subjectId });
  if (styleId) qb.andWhere('style.id = :styleId', { styleId });
  if (categoryId) qb.andWhere('product.category_id = :categoryId', { categoryId });
  if (artistId) qb.andWhere('product.artist_id = :artistId', { artistId });
  if (new_arrival) qb.andWhere('product.new_arrival = :new_arrival', { new_arrival });
  if (eliteChoice) qb.andWhere('product.eliteChoice = :eliteChoice', { eliteChoice });
  if (affordable_art) qb.andWhere('product.affordable_art = :affordable_art', { affordable_art });
  if (discount === 1) qb.andWhere('inventory.discount > 0');

  // ✅ Price range filter
  if (minPrice && maxPrice)
    qb.andWhere('inventory.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
  else if (minPrice)
    qb.andWhere('inventory.price >= :minPrice', { minPrice });
  else if (maxPrice)
    qb.andWhere('inventory.price <= :maxPrice', { maxPrice });

  // ✅ Default sorting
  qb.orderBy('inventory.updatedAt', 'DESC');

  // ✅ Execute query
  //const [result, total] = await qb.take(limit).skip(skip).getManyAndCount();
  const [result, total] = await qb.getManyAndCount();

  // ✅ Currency conversion rates
 // const conversionRates = { INR: 1, USD: 0.067, EUR: 0.061 };
//const rate = conversionRates[currency || 'INR'];
const rate = await this.getCurrencyRate(currency);

  // ✅ Compute displayPrice properly
let computed = result.map((inventory) => {
  const basePrice = Number(inventory.price || 0);
  const gst = Number(inventory.gstSlot || 0);
  const discount = Number(inventory.discount || 0);
  const shipping = Number(inventory.shippingWeight?.costINR || 0);

  // calculate total price in INR
 // const finalINR = basePrice + gst + shipping - discount;
 const finaldiscount = basePrice  - (basePrice*(discount/100));
   const finalINR = (finaldiscount  + (finaldiscount*(gst/100)));
  const  discountamount = (basePrice  + (basePrice*(gst/100)));
 const finaldiscountamount = Number((discountamount / rate).toFixed(2));
  const displayPrice = Number((finalINR / rate).toFixed(2));

  return {
    ...inventory,
    finaldiscountamount,
    displayPrice,
    currency: currency || 'INR', // include currency for frontend
  };
});

  // --- Filter by minPrice / maxPrice ---
  if (minPrice !== undefined) {
    computed = computed.filter((item) => item.displayPrice >= minPrice);
  }
  if (maxPrice !== undefined) {
    computed = computed.filter((item) => item.displayPrice <= maxPrice);
  }

  // ✅ Sort in memory by computed displayPrice
let sortedData = computed;
if (sortPrice === 'low') {
  sortedData = computed.sort((a, b) => a.displayPrice - b.displayPrice);
} else if (sortPrice === 'high') {
  sortedData = computed.sort((a, b) => b.displayPrice - a.displayPrice);
}
  // ✅ Apply pagination after sorting
 const paginatedData = sortedData.slice(skip, skip + limit);

  const data = plainToInstance(InventProdListDto, paginatedData, {
  excludeExtraneousValues: true,
});

 const response = new PaginationResponseDto<InventProdListDto>(data, {
  total,
  page,
  limit,
});

  await this.cacheService.set(cacheKey, JSON.parse(JSON.stringify(response)));
  return response;
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