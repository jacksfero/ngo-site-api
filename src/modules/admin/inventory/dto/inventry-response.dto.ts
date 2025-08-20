import { Expose,Exclude, Type } from 'class-transformer';
import { InventoryStatus } from 'src/shared/entities/inventory.entity';


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
export class ProductInvtDto {

  @Expose()
  id: number;

  @Expose()
  productTitle: string;

  @Expose()
  defaultImage: string;
}




@Exclude()
export class InventoryResponseDto {
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
  status: InventoryStatus;

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
