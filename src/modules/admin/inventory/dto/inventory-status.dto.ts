// dto/inventory-status.dto.ts
import { Expose } from 'class-transformer';

export class InventoryStatusDto {
  @Expose()
  key: string;

  @Expose()
  value: string;
}
