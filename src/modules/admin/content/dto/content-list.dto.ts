import { Expose, Exclude, Type } from 'class-transformer';


@Exclude()
export class RoleDto {
  @Expose()
  name: string;
}

@Exclude()
export class ContentListDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;
 
  @Expose()
  metaTitle: string;

  @Expose()
  metaDescription: string;
  
  @Expose()
  keywords: string;


  @Expose()
  status: string;
 
  @Expose()
  updatedAt: Date;

  @Expose()
  createdAt: Date;

 

}