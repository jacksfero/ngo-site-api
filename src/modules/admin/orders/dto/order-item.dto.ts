// dto/order-item.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductDto } from '../../cart/dto/cart-item-list.dto';

@Exclude()
export class OrderItemDto {
  @Expose()
  id: number;

 @Expose()
  @Type(() => ProductDto)
  product: ProductDto;
 
  @Expose()
  quantity: number;

  @Expose()
  price: number;

 
    @Expose()
  total  : number;

    @Expose()
  gstAmount: number;

 @Expose()
  discountAmount: number;

    @Expose()
  originalPrice: number; 

    @Expose()
  shipGstAmount: number; 
  
  @Expose()
  shipGstAmountOther: number;
}
