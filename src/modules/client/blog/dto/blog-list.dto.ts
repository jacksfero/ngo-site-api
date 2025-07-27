import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TagDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

@Exclude()
export class CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

@Exclude()
export class AuthorDto {
  @Expose()
  username: string;
}

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
  createdAt: Date;

  @Expose()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @Expose()
  @Type(() => AuthorDto)
  author?: AuthorDto;

  @Expose()
  @Type(() => TagDto)
  tags?: TagDto[];
}
