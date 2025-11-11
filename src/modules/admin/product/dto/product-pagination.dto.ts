import { IsOptional,IsInt, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { AdminPaginationBaseDto } from 'src/shared/dto/admin-pagination-base.dto';

export enum ProductSearchStatus {
  NEW_ARRIVAL = 'new_arrival',
  ELITE_CHOICE = 'eliteChoice',
  PRINTTING_RIGHTS = 'printing_rights',
  IS_LOCK = 'is_lock',
  NEGOTIABLE = 'negotiable',
 REFUNDABLE  = 'refundable',
 CERTIFICATE  = 'certificate',
  AFFORDABLE_ART = 'affordable_art',

   ONLY_DISPLAY_PRICE = 'only_display_price',
  PRICE_ON_DEMAND = 'price_on_demand',
  CONTACT_FOR_ART = 'contact_for_art',
}

// price_on_demand is ENUM (0,1,2)
export enum PriceOnDemandSearch {
  ONLY_DISPLAY_PRICE = 0,
  PRICE_ON_DEMAND = 1,
  CONTACT_FOR_ART = 2,
 // NEGOTIABLE_PRICE = 3,
 // AUCTION_PRICE = 4,
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
  message: `status must be one of: ${Object.values(ProductSearchStatus).join(', ')}`,
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
