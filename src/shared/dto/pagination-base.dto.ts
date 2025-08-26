// src/common/dto/pagination.dto.ts
import { IsOptional,Matches,MaxLength, MinLength,IsString, IsInt, Min, Max } from 'class-validator';
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
  @MinLength(3, { message: 'Search term must be at least 3 characters long' })
  @MaxLength(30, { message: 'Search term cannot exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_@.#&+]*$/, {
    message: 'Search term can only contain letters, numbers, spaces, and special characters: -_@.#&+'
  })
  @Transform(({ value }) => value.trim())
  search?: string;
 
}
