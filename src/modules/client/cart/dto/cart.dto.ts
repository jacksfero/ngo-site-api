import { IsInt,IsOptional,Length, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @Length(3,3)
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(2,2)
  shippingCountry?: string; // e.g., 'IN', 'US'
}

export class UpdateCartItemDto {
    @IsInt()
    itemId: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @Length(2,2)
  shippingCountry?: string;
}


