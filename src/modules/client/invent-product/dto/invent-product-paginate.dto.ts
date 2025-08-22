import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';


export class InventProdPaginatDto extends PaginationBaseDto {

 
  @IsOptional()
  categoryId?: number;

   @IsOptional()
  artistId?: number;

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
