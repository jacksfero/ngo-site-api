// src/common/dto/pagination-with-sort.dto.ts
import { PaginationDto } from './pagination.dto';
import { IsOptional, IsIn } from 'class-validator';

export class PaginationWithSortDto extends PaginationDto {
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  orderBy?: string = 'createdAt';
}  