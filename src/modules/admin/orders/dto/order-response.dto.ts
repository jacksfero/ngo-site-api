// dto/order-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer'; 
 
 import { OrderItemDto } from './order-item.dto';
 
import { UserDto } from 'src/modules/admin/cart/dto/cart-item-list.dto';
 
import { OrderStatus } from 'src/shared/entities/order.entity';
import { IsEnum } from 'class-validator';
import { PaymentStatus } from 'src/shared/entities/payment.entity';
 
 
 export  class PaymentDto {
  @Expose()
  id: number;

  @Expose()
  paymentGateway: string;

 @Expose()
  paymentMethod: string;

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

 export  class UsersAddressDTO {
  @Expose()
  id: number;

  @Expose()
  address: string;

  @Expose()
  city: string;

  @Expose()
  state: string; 
  
  @Expose()
  country: string;

@Expose()
  pin: string;
 
 @Expose()
  contact: string;
  
  @Expose()
  other_phone: string;
  
  @Expose()
  phonecode: string;
  
  @Expose()
  phonecode_other: string;
  
  @Expose()
  name: string;
}

@Exclude()
export class OrderResponseDto {
  @Expose()
  id: number;

@IsEnum(OrderStatus)
@Expose()
status: OrderStatus;

@IsEnum(PaymentStatus)
@Expose()
paymentStatus: PaymentStatus;
 
  @Expose()
  totalAmount: number;

 @Expose()
  orderNumber: number;

   @Expose()
  subtotal: number;

   @Expose()
  amountPaid: number;

   @Expose()
  discountAmount: number;

 @Expose()
  ShippingAmount: number;

   @Expose()
  currency: number;

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
  @Type(() => UsersAddressDTO)
  shippingAddress: UsersAddressDTO;

    @Expose()
    @Type(() => UsersAddressDTO)
   billingAddress: UsersAddressDTO;

  // // ✅ order items
   @Expose()
  @Type(() => OrderItemDto)
   items: OrderItemDto[];

   // // ✅ Payment items
   @Expose()
  @Type(() => PaymentDto)
   payments: PaymentDto[];
}
