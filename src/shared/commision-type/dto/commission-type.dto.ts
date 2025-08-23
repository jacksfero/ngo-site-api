// modules/commission-type/dto/commission-type.dto.ts
import { Expose } from 'class-transformer';

export class CommissionTypeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  percentage: number;

  @Expose()
  isActive: boolean;
}
