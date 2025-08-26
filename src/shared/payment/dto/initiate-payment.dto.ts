// dto/initiate-payment.dto.ts
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;

  @IsEnum(['PayUMoney', 'Razorpay', 'PayPal'])
  gateway: 'PayUMoney' | 'Razorpay' | 'PayPal';

  @IsString()
  productName: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}
