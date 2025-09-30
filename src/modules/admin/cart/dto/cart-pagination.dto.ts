import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';


export class CartPaginationDto extends PaginationBaseDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

  
}
