import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { IsEnum, IsOptional, IsInt, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';
//import { InventoryStatus } from 'src/shared/entities/inventory.entity';
 
import { AdminPaginationBaseDto } from 'src/shared/dto/admin-pagination-base.dto';

export class InventoryPaginationDto extends AdminPaginationBaseDto {
  // declare status?: InventoryStatus; // ✅ fixes overwrite warning

  @IsOptional()
  status?: Boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  artistId: number;

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
