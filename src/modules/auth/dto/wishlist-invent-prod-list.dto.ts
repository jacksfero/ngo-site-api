import { Expose, Exclude, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ProductStatus } from 'src/shared/entities/product.entity';
import {  MediumDto, SurfaceDto } from 'src/modules/client/invent-product/dto/invent-product-detail-response.dto';
import { ShippingInvtDto,CategoryDto,ArtistDto } from 'src/modules/client/invent-product/dto/invent-prod-list.dto';
//import { InventoryStatus } from 'src/shared/entities/inventory.entity';
  
@Exclude()
export class InventoryDto {
  @Expose()
  id: number;
 

  @Expose()
  @Type(() => ShippingInvtDto)
  shippingWeight: ShippingInvtDto;
 
  @Expose()
  productId: number;
 
  @Expose()
  price: number;

  @Expose()
  discount: number;

  @Expose()
  gstSlot: string;

  @Expose()
  shippingSlot: string;
 
  @Expose()
  updatedAt: Date;
}
@Exclude()
export class ProductInvtDto {

  @Expose()
  id: number;

  @Expose()
  productTitle: string;

  @Expose()
  slug: string;

  @Expose()
  defaultImage: string;

  @Expose()
  price_on_demand: boolean;

  @Expose()
  weight: string;

  @Expose()
  width: string;

  @Expose()
  height: string;

  @Expose()
  depth: string;

  @Expose()
  @IsEnum(ProductStatus, { each: true }) // validate against enum
  is_active: ProductStatus;

  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @Expose()
  @Type(() => SurfaceDto)
  surface: SurfaceDto;

  @Expose()
  @Type(() => MediumDto)
  medium: MediumDto;

  @Expose()
  @Type(() => ArtistDto)
  artist: ArtistDto;

  @Expose()
   @Type(() => InventoryDto) 
   productInventory: InventoryDto;
 
}
 
@Exclude()
export class WishlistInventProdDto {
  @Expose()
  id: number; // wishlist id

  @Expose()
  product_id: number;

  @Expose()
  createdAt: Date;
  
 // nested product + inventory (since there is one inventory per product)
 @Expose()
  @Type(() => ProductInvtDto)
   product: ProductInvtDto;

 
}