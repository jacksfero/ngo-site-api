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


@Injectable()
export class InventProductService {

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}


  

  async findAll(
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

    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
    .leftJoinAndSelect('product.category', 'category')
    // .leftJoinAndSelect('product.subjects', 'subject') // manytomany
    // .leftJoinAndSelect('product.styles', 'style')
    .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
    .where('inventory.status = :status', { status:true })
    //.andWhere('product.is_active = :isActive', { isActive: "Active" });
    .andWhere('product.is_active = :isActive', { isActive:  ProductStatus.ACTIVE })

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
 const defaultProductFields = ['id', 'productTitle','price_on_demand','is_active','depth','height','width','weight','slug', 'defaultImage'];
 const defaultArtistFields = ['id', 'username'];
 const defaultCategoryFields = ['id', 'name'];
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

      // Default artist fields (always included)
      ...defaultArtistFields.map(field => `artist.${field}`),
      
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
  
    return new PaginationResponseDto<InventProdListDto>(data, { total, page, limit  }); 
  }

 // inventory.service.ts
 async findOne(productSlug: string): Promise<InventProductDetailResponseDto> {
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
      statuses: [ProductStatus.ACTIVE, ProductStatus.SOLD_OUT] 
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
      'inventory.price',
      'inventory.gstSlot',
      'inventory.shippingSlot',
      

   /*   // ✅ Shipping weight (if entity has fields)
      'shippingWeight.id',
      'shippingWeight.weight',
      'shippingWeight.unit',*/
    ])
    .getOne();

    if (!inventory) {
      throw new NotFoundException(`Product with slug "${productSlug}" not found or out of stock`);
    }

  return plainToInstance(
    InventProductDetailResponseDto,
    {
      ...inventory.product,
      inventories: [inventory],
    },
    { excludeExtraneousValues: true },
  );
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

  const qb = this.inventoryRepo.createQueryBuilder('inventory')
  .leftJoinAndSelect('inventory.product', 'product')
  .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
  .leftJoinAndSelect('product.category', 'category')
  // .leftJoinAndSelect('product.subjects', 'subject') // manytomany
  // .leftJoinAndSelect('product.styles', 'style')
  .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
  .where('inventory.status = :status', { status:true })
  .andWhere('product.is_active = :statuses', { statuses:  ProductStatus.SOLD_OUT })

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

  return new PaginationResponseDto<InventProdListDto>(data, { total, page, limit  }); 
}
  
}



/*


GET /frontend/inventory?page=1&limit=12&search=painting&categoryId=2&artistId=5
*/