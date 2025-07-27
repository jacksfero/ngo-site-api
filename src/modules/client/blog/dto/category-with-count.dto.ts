// src/modules/client/blog/dto/category-with-count.dto.ts
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class CategoryWithBlogCountDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  blogCount: number;
}
