// upload-product-image.dto.ts
import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadProductImageDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  productId: number;
}
