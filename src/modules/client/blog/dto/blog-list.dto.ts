// src/client/blog/dto/blog-list.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class BlogListDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

   @Expose()
  titleImage: string;

  @Expose()
  h1Title: string;

  @Expose()
  blogContent: string;

  @Expose()
  keywordsTag: string;

  @Expose()
  descriptionTag: string;  

  @Expose()
  optionalTitle: string;

  @Expose()
  created_at: Date;

  @Expose()
  category?: {
    id: number;
    name: string;
  };


  @Expose()
  author?: {    
    username: string;
  };


  @Expose()
  @Type(() => TagDto)
  tags?: TagDto[];
}

@Exclude()
export class TagDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
