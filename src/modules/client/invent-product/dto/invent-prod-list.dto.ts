import { Expose, Exclude, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { MediumDto, SurfaceDto } from './invent-product-detail-response.dto';
//import { InventoryStatus } from 'src/shared/entities/inventory.entity';


@Exclude()
export class ShippingInvtDto {
  @Expose()
  weightSlot: string;

  @Expose()
  costINR: number;

  @Expose()
  CostOthers: number;
}
@Exclude()
export class ArtistDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
@Exclude()
export class CategoryDto {
   @Expose()
   id: number;

  @Expose()
  name: string;
}
 export class SubjectDto {
   @Expose()
   id: number;

  @Expose()
  subject: string;

   @Expose()
  description: string;
}
 
 

export class styleDto {
   @Expose()
   id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;
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
  @Type(() => SubjectDto)
  subjects: SubjectDto;


   @Expose()
  @Type(() => styleDto)
  styles: styleDto;

  @Expose()
  @Type(() => MediumDto)
  medium: MediumDto;

  @Expose()
  @Type(() => ArtistDto)
  artist: ArtistDto;
 
}

@Exclude()
export class ProductInvtArtistDto {

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
 
}
 

@Exclude()
export class InventProdListDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ProductInvtDto)
  product?: ProductInvtDto;

  @Expose()
  @Type(() => ShippingInvtDto)
  shippingWeight: ShippingInvtDto;
 
  @Expose()
  productId: number;

  @Expose()
  entryDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  status: Boolean;

  @Expose()
  price: number;

  @Expose()
  discount: number;

  @Expose()
  gstSlot: string;

  @Expose()
  shippingSlot: string;

  @Expose()
  termsAndConditions: string;

   @Expose()
  finaldiscountamount: number;

  @Expose()
  displayPrice: number;

  @Expose()
  currency: string;

  @Expose()
  updatedAt: Date;
}


@Exclude()
export class InventProdListArtistDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ProductInvtArtistDto)
  product?: ProductInvtArtistDto;

  @Expose()
  @Type(() => ShippingInvtDto)
  shippingWeight: ShippingInvtDto;
 
  @Expose()
  productId: number;

  @Expose()
  entryDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  status: Boolean;

  @Expose()
  price: number;

  @Expose()
  discount: number;

  @Expose()
  gstSlot: string;

  @Expose()
  shippingSlot: string;

  @Expose()
  termsAndConditions: string;

   @Expose()
  finaldiscountamount: number;

  @Expose()
  displayPrice: number;

  @Expose()
  currency: string;

  @Expose()
  updatedAt: Date;
}
