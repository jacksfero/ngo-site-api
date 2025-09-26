import { IsOptional,IsInt, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { AdminPaginationBaseDto } from 'src/shared/dto/admin-pagination-base.dto';

export enum ProductSearchStatus {
  NEW_ARRIVAL = 'new_arrival',
  ELITE_CHOICE = 'eliteChoice',
  FEATURED = 'featured',
  IS_LOCK = 'is_lock',
  NEGOTIABLE = 'negotiable',
  PRICE_ON_DEMAND = 'price_on_demand',
  AFFORDABLE_ART = 'affordable_art',
}
export class ProductPaginationDto extends AdminPaginationBaseDto {
  // @IsOptional()
  // @IsBoolean()
  // @Transform(({ value }) => {
  //   if (value === 'true' || value === '1') return true;
  //   if (value === 'false' || value === '0') return false;
  //   return value;
  // })
  // status?: boolean;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  categoryId: number;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  artistId: number;

  @IsOptional()
  @IsEnum(ProductSearchStatus, {
    message: 'status must be one of new_arrival, eliteChoice, featured',
  })
  status?: ProductSearchStatus;

  @IsOptional()
  @IsEnum(ProductStatus)
  is_active?: ProductStatus; // For direct status input

 /* @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  role?: string;*/
}
