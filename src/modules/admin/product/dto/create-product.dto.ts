import { IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  productTitle: string;

  @IsString()
  description: string;
}
