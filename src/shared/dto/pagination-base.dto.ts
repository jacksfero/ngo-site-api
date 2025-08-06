// src/common/dto/pagination.dto.ts
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';

export class PaginationBaseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  search?: string;
 
}
