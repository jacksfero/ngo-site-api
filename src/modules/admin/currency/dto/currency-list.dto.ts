// product-list.dto.ts
import { Expose } from 'class-transformer';

export class CurrencyListDto {
  @Expose()
  id: number;

  @Expose()
  code: string; // formatted: name (id)

  @Expose()
  currency: string; // formatted: name (id)

  @Expose()
  value: number; // formatted: name (id)


  @Expose()
  icon: number; // formatted: name (id)
}
