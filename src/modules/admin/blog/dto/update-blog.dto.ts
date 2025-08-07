import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsOptional()
  @IsString()
  titleImage?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  tagIds?: number[];
}