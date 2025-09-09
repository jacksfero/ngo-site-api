import { Expose, Exclude, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ProductStatus } from 'src/shared/entities/product.entity';
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
  @Type(() => ArtistDto)
  artist: ArtistDto;

  // // ✅ If you just need artistId
  // @Expose()
  // get artistId(): number {
  //   return this.artist?.id ?? null;
  // }

  // Optional: full artist details

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
  updatedAt: Date;
}
