import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';


export class ProductPaginationDto extends PaginationBaseDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

 /* @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  role?: string;*/
}
