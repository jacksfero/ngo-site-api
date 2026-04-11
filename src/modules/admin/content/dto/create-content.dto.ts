import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

import { PageType } from '../enums/page.type.enum';
import { ContentStatus } from '../enums/content.status.enum';

export class CreateContentDto {

  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  slug?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsEnum(PageType)
  type?: PageType;

  // ✅ SEO
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  // ✅ publish
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  // ✅ sorting
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}