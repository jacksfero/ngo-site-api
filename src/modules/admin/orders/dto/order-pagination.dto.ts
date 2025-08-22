// dto/order-pagination.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';

export class OrderPaginationDto extends PaginationBaseDto {
  // optional filters
  @IsOptional()       
  status?: Boolean;

 

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
