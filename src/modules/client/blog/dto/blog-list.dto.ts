import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TagDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}

@Exclude()
export class CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}


@Exclude()
export class AboutDto {
  @Expose()
  about: string;
}


@Exclude()
export class ProfileImgDto {
  @Expose()
  imageUrl: string;
}


@Exclude() 
export class AuthorDetailDto {
  // @Expose()
  // id: number;

   @Expose()
  username: string;

 @Expose()
 @Type(() => AboutDto)
  aboutDetails: AboutDto; 

 @Expose()
 @Type(() => ProfileImgDto)
  profileImage: ProfileImgDto; 
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
  views: number;

  @Expose()
  titleImage: string;

  @Expose()
  h1Title: string;

 /* @Expose()
  blogContent: string;*/

 
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
  keywordsTag: string;

  @Expose()
  descriptionTag: string;

  @Expose()
  optionalTitle: string;

  @Expose()
  createdAt: Date;

  @Expose()
  scheduledPublishDate: Date;

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


export class BlogListDetailDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

   @Expose()
  views: number;

  @Expose()
  titleImage: string;

  @Expose()
  h1Title: string;

 /* @Expose()
  blogContent: string;*/

 
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
  keywordsTag: string;

  @Expose()
  descriptionTag: string;

  @Expose()
  optionalTitle: string;

  @Expose()
  createdAt: Date;

  @Expose()
  scheduledPublishDate: Date;

  @Expose()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @Expose()
  @Type(() => AuthorDetailDto)
  author?: AuthorDetailDto;

  @Expose()
  @Type(() => TagDto)
  tags?: TagDto[];
}
