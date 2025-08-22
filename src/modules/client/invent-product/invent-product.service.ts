import { Injectable } from '@nestjs/common';
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


@Injectable()
export class InventProductService {

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}


  create(createInventProductDto: CreateInventProductDto) {
    return 'This action adds a new inventProduct';
  }

  async findAll(
    paginationDto: InventProdPaginatDto,
  ): Promise<PaginationResponseDto<InventProdListDto>> {
   // let categoryId?:number ;

    const { page, limit,search, categoryId, artistId,select /*status, productId, startDate, endDate, */ } = paginationDto;
   // let categoryId?:number ;
   
    const skip = (page - 1) * limit;

    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
    .leftJoinAndSelect('product.category', 'category')
   // .leftJoinAndSelect('product.images', 'images')
    .leftJoinAndSelect('inventory.shippingWeight', 'shipping')
    .andWhere('inventory.status = :status', { status:true });
    if (search) {
      qb.andWhere('product.name LIKE :search OR product.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId });
    }

    if (artistId) {
      qb.andWhere('product.artist_id = :artistId', { artistId });
    }

  /*  // ✅ Filtering
    if (status) {
      qb.andWhere('inventory.status = :status', { status });
    }
  
    if (productId) {
      qb.andWhere('inventory.product_id = :productId', { productId });
    }
  
    if (startDate && endDate) {
      qb.andWhere('inventory.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }*/
  
 // ✅ Define default fields (always selected)
 const defaultInventoryFields = ['id', 'status', 'price', 'discount','gstSlot','shippingSlot','updatedAt'];
 const defaultProductFields = ['id', 'productTitle', 'defaultImage'];
 const defaultArtistFields = ['id', 'username'];
 const defaultCategoryFields = ['id', 'name'];
 const defaultShippingFields = ['weightSlot', 'costINR'];

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
 async findOne(productId: number): Promise<InventProductDetailResponseDto> {
  const inventory = await this.inventoryRepo
    .createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.images', 'images')
   // .leftJoinAndSelect('inventory.shippingWeight', 'shippingWeight')
    .where('product.id = :productId', { productId })
    .select([
      // ✅ Product fields
      'product.id','product.created_in','product.original_painting',
      'product.productTitle', 'product.negotiable','product.refundable',
      'product.description', 'product.certificate', 'product.conditions',
      'product.price_on_demand',

      // ✅ Category fields
      'category.id',
      'category.name',

      // ✅ Artist fields
      'artist.id',
      'artist.username',
      

      // ✅ Images fields
      'images.id',
      'images.imagePath',
       

      // ✅ Inventory fields
      'inventory.id',
      'inventory.discount',
      'inventory.price',

   /*   // ✅ Shipping weight (if entity has fields)
      'shippingWeight.id',
      'shippingWeight.weight',
      'shippingWeight.unit',*/
    ])
    .getOne();

  if (!inventory) {
    throw new Error(`Product with ID ${productId} not found`);
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


  update(id: number, updateInventProductDto: UpdateInventProductDto) {
    return `This action updates a #${id} inventProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventProduct`;
  }
}



/*


GET /frontend/inventory?page=1&limit=12&search=painting&categoryId=2&artistId=5
*/