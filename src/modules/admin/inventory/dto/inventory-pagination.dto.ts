import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryStatus } from 'src/shared/entities/inventory.entity';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';

export class InventoryPaginationDto extends PaginationBaseDto {
    // declare status?: InventoryStatus; // ✅ fixes overwrite warning

      @IsOptional()
      @IsEnum(InventoryStatus)
      status?: InventoryStatus;

  @IsOptional()
  @IsNumberString()
  productId?: number;

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD

  @IsOptional()
  @Type(() => String)
  select?: string; // comma separated fields
}
