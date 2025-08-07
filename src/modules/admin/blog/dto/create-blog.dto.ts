import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  
  IsString,
  Length,
  IsInt,
  IsArray,
  IsBoolean,
  IsDate,
} from 'class-validator';


export class CreateBlogDto {

  @IsNotEmpty()
  @IsString()  
  title: string;

  @IsOptional()
  @IsString() 
  slug?: string;

  @IsNotEmpty()
  @IsString() 
  h1Title: string;

  @IsString()
  @IsOptional()
  titleImage?: string | null;

  @IsNotEmpty()
  @IsString()
  blogContent: string;

  @IsString()
  @IsOptional()
  descriptionTag?: string;

  @IsString()
  @IsOptional()
  optionalTitle?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  scheduledPublishDate?: Date | null;
  
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
  
  @IsInt()
  @Type(() => Number) // 👈 convert string to number
  categoryId: number;

  @IsArray()
  @IsOptional()
  tagIds?: number[];

  // @IsInt()
  // authorId: number;
}
