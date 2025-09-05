import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from 'src/shared/entities/inventory.entity';
import { Product } from 'src/shared/entities/product.entity';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { InventoryPaginationDto } from './dto/inventory-pagination.dto';
import { InventoryResponseDto } from './dto/inventry-response.dto';
import { InventoryStatusDto } from './dto/inventory-status.dto';
import { AartworkGstSlot, ShippingGstSlot } from '../shipping/enums/gst.enum';
import { Shipping } from 'src/shared/entities/shipping.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
     private inventoryRepo: Repository<Inventory>,

    @InjectRepository(Product) private productRepo: Repository<Product>,

    @InjectRepository(Shipping)
     private shippingRepo: Repository<Shipping>,
  ) {}
   
  /*getStatuses(): InventoryStatusDto[] {
    const statuses = Object.entries(InventoryStatus).map(([key, value]) => ({
      key,
      value,
    }));
   // return Object.values(InventoryStatus);
    return plainToInstance(InventoryStatusDto, statuses, {
      excludeExtraneousValues: true,
    });
  }*/

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    const shipping = await this.shippingRepo.findOne({ where: { id: dto.shippingId } });
    if (!shipping) {
      throw new NotFoundException('Shipping not found');
    }
  
    // check if product already has an inventory
    const existing = await this.inventoryRepo.findOne({ where: { product: { id: dto.productId } } });
    if (existing) {
      throw new BadRequestException('This product already has an inventory');
    }

   // console.log('dto data ---------',dto.shippingSlot);
     
    // ✅ Assign relations properly
    const inventory = this.inventoryRepo.create({
      ...dto,
      product,
      gstSlot : AartworkGstSlot[dto.gstSlot],
      shippingSlot: ShippingGstSlot[dto.shippingSlot],
        shippingWeight: shipping, // instead of raw shippingId
    });


   // console.log('Operation completed successfully.');
    //process.exit(0);

  
    return this.inventoryRepo.save(inventory);
  }
  
 
  async findAll(
    paginationDto: InventoryPaginationDto,
  ): Promise<PaginationResponseDto<InventoryResponseDto>> {
    const { page, limit, status, productId, startDate,
      categoryId,artistId,search,
      endDate, select } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.inventoryRepo.createQueryBuilder('inventory')
    .leftJoinAndSelect('inventory.product', 'product')
    .leftJoinAndSelect('product.artist', 'artist') // ✅ CRITICAL: Join the artist
    .leftJoinAndSelect('inventory.shippingWeight', 'shipping');

   // console.log(artistId,'----artist---id-=======---------')
    // ✅ Filtering
    if (status) {
      qb.andWhere('inventory.status = :status', { status });
    }
    if (artistId) { 
       console.log(artistId,'----artist id----------')
      qb.andWhere('product.artist_id = :artistId', { artistId  });
    }
    if (categoryId) {
      // console.log(categoryId,'----cateid----------')
       qb.andWhere('product.category_id LIKE :categoryId', { categoryId   });
     }
  
    if (productId) {
      qb.andWhere('inventory.product_id = :productId', { productId });
    }
  
    if (startDate && endDate) {
      qb.andWhere('inventory.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }
  
 // ✅ Define default fields (always selected)
 const defaultInventoryFields = ['id', 'status', 'price', 'discount','gstSlot','shippingSlot','updatedAt'];
 const defaultProductFields = ['id', 'productTitle', 'defaultImage'];
 const defaultArtistFields = ['id', 'username'];
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
      ...defaultArtistFields.map(field => `artist.${field}`),
      
      // Default shipping fields (always included)
      ...defaultShippingFields.map(field => `shipping.${field}`),
    ]);
   // console.log('------aaaaaa---=======---------')
   //// process.exit();
  
    // ✅ Pagination
    //qb.skip((page - 1) * limit).take(limit);
  
    const [result, total] = await qb.orderBy('inventory.id', 'DESC').take(limit).skip(skip).getManyAndCount();
  
    // const data = plainToInstance(InventoryResponseDto, items, {
    //   excludeExtraneousValues: true,
    // });
  
 //   return new PaginationResponseDto<InventoryResponseDto>(data, total, page, limit);

    const data = plainToInstance(InventoryResponseDto, result, {
      excludeExtraneousValues: true,
    });
  
    return new PaginationResponseDto(data, { total, page, limit  }); 
  }
 
  async findByProduct(productId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({
       where: { product: { id: productId } }, 
       relations: ['product'] 
      
      });
    if (!inventory) throw new NotFoundException('Inventory not found for this product');
    return inventory;
  }

  async update(id: number, dto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    if (!inventory) throw new NotFoundException('Inventory not found for this product');
    Object.assign(inventory, dto);
    // If you need to explicitly map gstSlot
 if (dto.gstSlot) {
    inventory.gstSlot = AartworkGstSlot[dto.gstSlot];
  }
  if (dto.shippingSlot) {
    inventory.shippingSlot = ShippingGstSlot[dto.shippingSlot];
  } 
  /* if (dto.status) {
    inventory.status = dto.status;
  } 
  if (dto.status) {
    inventory.status = dto.status;
  } */
if (dto.termsAndConditions) {
    inventory.termsAndConditions = dto.termsAndConditions;
  } 
    return this.inventoryRepo.save(inventory);
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({
       where: { id }, 
       relations: ['product','product.artist','product.size','product.shippingTime',
       'product.commissionType', 'product.packingMode', 'product.category'] });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async toggleStatus(id: number, user: any): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`inventory   with ID ${id} not found`);
    }
    inventory.status = !inventory.status;
    inventory.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.inventoryRepo.save(inventory);
  }


  async remove(id: number): Promise<void> {
    await this.inventoryRepo.delete(id);
  }
}
