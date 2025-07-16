import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
