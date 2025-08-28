import { IsOptional,Min,IsInt,IsNumber, IsBoolean, IsString } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';

export class InventProdPaginatDto extends PaginationBaseDto {

    
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

 /* @IsOptional()
  @Type(() => Number)
  @IsInt()
  packingmodeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  commissiontypeId?: number; */
  
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


 /* @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  role?: string;*/
}
