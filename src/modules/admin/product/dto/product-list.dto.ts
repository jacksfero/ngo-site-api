// product-list.dto.ts
import { Expose } from 'class-transformer';

export class ProductListDto {
  @Expose()
  id: number;

  @Expose()
  productTitle: string; // formatted: name (id)
}
