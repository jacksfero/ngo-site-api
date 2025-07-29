import { Expose } from 'class-transformer';

export class UserListByRoleNameDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

   
}