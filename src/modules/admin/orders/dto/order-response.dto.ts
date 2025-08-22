// dto/order-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer'; 
 
import { OrderItemDto } from './order-item.dto';
import { OrderStatus } from 'aws-sdk/clients/outposts';
import { User } from 'src/shared/entities/user.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';

@Exclude()
export class OrderResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: OrderStatus;

  @Expose()
  totalAmount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // ✅ user info
  @Expose()
  @Type(() => User)
  user: User;

  // ✅ shipping address
  @Expose()
  @Type(() => UsersAddress)
  shippingAddress: UsersAddress;

  // ✅ order items
  @Expose()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
