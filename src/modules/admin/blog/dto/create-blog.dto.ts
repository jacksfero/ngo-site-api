import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  Length,
} from 'class-validator';
import { Category } from '../enums/category.enum';

export class CreateBlogDto {
  @IsEnum(Category)
  categoryId: Category;

  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  slug: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 50)
  h1Title: string;

  @IsNotEmpty()
  @IsString()
  blogContent: string;

  @IsOptional()
  @IsDateString()
  scheduledPublishDate?: Date;
}
