import { IsOptional,IsInt, IsBoolean, IsString } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';


export class ProductPaginationDto extends PaginationBaseDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  status?: boolean;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  categoryId: number;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  artistId: number;


 /* @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  role?: string;*/
}
