// dto/order-item.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class OrderItemDto {
  @Expose()
  id: number;

  @Expose()
  productId: number; // from relation inside OrderItem entity

  @Expose()
  quantity: number;

  @Expose()
  price: number;
}
