import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
    @IsInt()
    itemId: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}


