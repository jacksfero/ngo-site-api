// src/products/dto/product.dto.ts
import { Expose } from 'class-transformer';

export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  productTitle: string;

  @Expose()
  tags: string;

  @Expose()
  artist_price: number;

  @Expose()
  is_lock: number;

  @Expose()
  category_id: number;

  @Expose()
  status: number;

  @Expose()
  description: string;

  @Expose()
  defaultImage: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}