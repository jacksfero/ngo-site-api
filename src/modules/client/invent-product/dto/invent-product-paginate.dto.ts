import { IsOptional,Min,IsIn,IsInt,IsNumber, IsBoolean, IsString } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';

export class InventProdPaginatDto extends PaginationBaseDto {

    
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  new_arrival?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  eliteChoice?: boolean;


  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  affordable_art?: boolean;

 @IsOptional()
  @Type(() => Number) 
  @IsInt()
  discount: number;


  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  categoryId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  artistId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  surfaceId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mediumId?: number;

  // existing fields...
  @IsOptional()
  @IsNumber()
  @Type(() => Number)  // This transforms string to number
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)  // This transforms string to number
  maxPrice?: number;

   @IsOptional()
  @IsIn(['low', 'high'])
  sortPrice?: 'low' | 'high';
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orientationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  styleId?: number;

  @IsOptional()
  @Type(() => String)
  select?: string; // comma separated fields

 
}
