import { Expose, Type } from 'class-transformer';

export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  productTitle: string;

   @Expose()
  defaultImage: string;
}

export  class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  mobile: string;
}

class CartDto {
  @Expose()
  id: number;

   @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

   @Expose()
  guestId: string;
}


export class CartItemListDto {
  @Expose()
  id: number;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  @Type(() => ProductDto)
  product: ProductDto;

  @Expose()
  @Type(() => CartDto)
  cart: CartDto;
 
 
}



