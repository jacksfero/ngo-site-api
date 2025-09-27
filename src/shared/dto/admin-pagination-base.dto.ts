// src/common/dto/pagination.dto.ts
import { IsOptional,ValidateIf,Matches,MaxLength, MinLength,IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';

export class AdminPaginationBaseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number;

  @IsOptional()
  @ValidateIf((o) => o.search && o.search.trim().length > 0) // Only validate if search exists and is not empty
  @IsString()
  @MinLength(1, { message: 'Search term must be at least 1 characters long' })
  @MaxLength(30, { message: 'Search term cannot exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_@.#&+]*$/, {
    message: 'Search term can only contain letters, numbers, spaces, and special characters: -_@.#&+'
  })
  @Transform(({ value }) => value?.trim() || '') // Handle undefined and null
  search?: string;
 
}
