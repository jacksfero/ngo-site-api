import { Expose,Exclude, Type } from 'class-transformer';


@Exclude()
export class RoleDto {
  @Expose()
  name: string;
}


@Exclude()
export class BlogListDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  mobile: string;

  @Expose()
  status: boolean;

  @Expose()
  is_verified: boolean;

  @Expose()
  createdAt: Date;
  
  @Expose()
  @Type(() => RoleDto)
  roles?: RoleDto[];

}