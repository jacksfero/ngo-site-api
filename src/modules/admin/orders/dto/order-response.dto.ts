// dto/order-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer'; 
 
 import { OrderItemDto } from './order-item.dto';
 
import { UserDto } from 'src/modules/admin/cart/dto/cart-item-list.dto';
 
 import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { OrderStatus } from 'src/shared/entities/order.entity';
import { IsEnum } from 'class-validator';
import { PaymentStatus } from 'src/shared/entities/payment.entity';
 
 
 export  class PaymentDto {
  @Expose()
  id: number;

  @Expose()
  paymentGateway: string;

  @Expose()
  amount: string;

  @Expose()
  paidAt: string; 
  
  @Expose()
  gatewayResponse: string;

  @IsEnum(PaymentStatus) 
  @Expose()
  status: PaymentStatus;


}

@Exclude()
export class OrderResponseDto {
  @Expose()
  id: number;

@IsEnum(OrderStatus)
@Expose()
status: OrderStatus;

  @Expose()
  totalAmount: number;

 @Expose()
  orderNumber: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // ✅ user info
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  // ✅ shipping address
   @Expose()
    @Type(() => UsersAddress)
   shippingAddress: UsersAddress;

    @Expose()
    @Type(() => UsersAddress)
   billingAddress: UsersAddress;

  // // ✅ order items
   @Expose()
  @Type(() => OrderItemDto)
   items: OrderItemDto[];

   // // ✅ Payment items
   @Expose()
  @Type(() => PaymentDto)
   payments: PaymentDto[];
}
