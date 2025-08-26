import { IsNumber, IsString } from 'class-validator';

export class PaymentRequestDto {
  @IsString()
  txnId: string;

  @IsNumber()
  amount: number;

  @IsString()
  productInfo: string;

  @IsString()
  firstName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}
