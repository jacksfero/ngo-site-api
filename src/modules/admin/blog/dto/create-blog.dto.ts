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
  IsNumber,
} from 'class-validator';


export class CreateBlogDto {

  @IsNotEmpty()
  @IsString()  
  title: string;

  
  @IsString() 
  slug: string;

  @IsNumber() 
  author: number;


  @IsString()
  @IsOptional()
  titleImage?: string | null;

  @IsNotEmpty()
  @IsString()
  blogContent: string;

  @IsString()
  @IsOptional()
  descriptionTag?: string | null;  // Add null type
 
 
  @IsString()
  @IsOptional()
  keywordsTag?: string | null;  // Add null type
 
  @IsOptional()
  @IsString() 
  h1Title?: string | null;   // Add null type

  @IsString()
  @IsOptional()
  optionalTitle?: string | null;   // Add null type
 

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
