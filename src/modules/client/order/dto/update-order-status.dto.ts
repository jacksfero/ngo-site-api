// dto/update-order-status.dto.ts
import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/shared/entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}