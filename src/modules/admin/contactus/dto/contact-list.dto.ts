import { Expose,Exclude, Type } from 'class-transformer';
 
import { ProductListDto } from '../../product/dto/product-list.dto';
 


@Exclude()
export class ContactListDto {
  @Expose()
  name: string;

   @Expose()
  phonecode: string;

   @Expose()
  mobile: string;

   @Expose()
  email: string;

   @Expose()
  message: string;

   @Expose()
  type: string;

   @Expose()
  subject: string;
 
  //  @Expose()
  // @Type(() => ProductListDto)
  // product: ProductListDto;
   @Expose()
  product: {
    id: number;
    productTitle: string;
  } | null;

   @Expose()
  createdAt: Date;
}
