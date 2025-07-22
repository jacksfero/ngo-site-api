import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  
  IsString,
  Length,
  IsInt,
  IsArray,
} from 'class-validator';


export class CreateBlogDto {

  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  title: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  slug?: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 80)
  h1Title: string;

 
  @IsOptional()
  @IsString()
  titleImage?: string;

  @IsNotEmpty()
  @IsString()
  blogContent: string;

  @IsOptional()
  @IsDateString()
 
  scheduledPublishDate?: Date;

  @IsInt()
  @Type(() => Number) // 👈 convert string to number
  categoryId: number;

  @IsArray()
  @IsOptional()
  tagIds?: number[];

  // @IsInt()
  // authorId: number;
}
