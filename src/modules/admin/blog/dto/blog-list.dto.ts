import { Expose,Exclude, Type } from 'class-transformer';
 

@Exclude()
export class AuthorDto {
  @Expose()
  username: string;
}

@Exclude()
export class CategoryDto {
  @Expose()
  name: string;
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
  h1Title: string;
  
  @Expose()
  titleImage: string;

  @Expose()
  get contentSnippet(): string {
    if (!this.blogContent) return '';
    return this.blogContent.length > 15
      ? this.blogContent.substring(0, 15) + '...'
      : this.blogContent;
  } 
 
  @Expose()
  blogContent?: string; // keep original for mapping

  @Expose()
  status: boolean;
 
  @Expose()
  updatedAt: Date;

  @Expose()
  scheduledPublishDate: Date;
    
  @Expose()
  @Type(() => AuthorDto)
  author?: AuthorDto;

  @Expose()
  @Type(() => CategoryDto)
  category?: CategoryDto;

}