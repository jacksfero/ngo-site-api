import { Expose, Type } from 'class-transformer';
import { InventoryStatus } from 'src/shared/entities/inventory.entity';


export class InventoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  startDate: Date;

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
  shippingWeight: string;

  @Expose()
  shippingSlot: string;

  @Expose()
  termsAndCondition: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
