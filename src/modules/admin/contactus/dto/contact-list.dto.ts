import { Expose,Exclude, Type } from 'class-transformer';
 


@Exclude()
export class ContactListDto {
  @Expose()
  name: string;
}
