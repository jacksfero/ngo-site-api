// product-list.dto.ts
import { Expose } from 'class-transformer';

export class ShippingListDto {
  @Expose()
  id: number;

  @Expose()
  weightSlot: string; // formatted: name (id)

  @Expose()
  CostOthers: number; // formatted: name (id)


  @Expose()
  costINR: number; // formatted: name (id)
}
