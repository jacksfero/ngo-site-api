// dto/order-item.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ProductDto } from '../../cart/dto/cart-item-list.dto';
import { OrderItemStatus } from 'src/shared/entities/order-item.entity';

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

  @IsEnum(OrderItemStatus)
  @Expose()
  status: OrderItemStatus;


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
