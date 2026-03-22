import { Expose, Exclude, Type } from 'class-transformer';


@Exclude()
export class RoleDto {
  @Expose()
  name: string;
}

@Exclude()
export class UsersListDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;
 
  @Expose()
  mobile: string;

  @Expose()
  status: boolean;

  @Expose()
  is_verified: boolean;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => RoleDto)
  roles?: RoleDto[];

}