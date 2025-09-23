// src/cart/dto/update-cart-currency.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCartCurrencyDto {
  @IsString()
  @IsNotEmpty()
  currency: string;
}