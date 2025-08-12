import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ListMediaDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  search?: string;
}
