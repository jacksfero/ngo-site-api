// src/products/dto/product.dto.ts
import { Expose,Transform,Type } from 'class-transformer';
import { ProductStatus } from 'src/shared/entities/product.entity';
export class CategoryDto {
  @Expose()
  id: number;

 @Expose()
 name: string;
}
export class ArtistDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
export class OwnerDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
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
  @Type(() => ArtistDto)
  artist: ArtistDto;

  @Expose()
  @Type(() => OwnerDto)
  owner: ArtistDto;

  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @Expose()
  is_lock: number;

  @Expose()
  category_id: number;

  @Expose()
  @Transform(({ value }) => value) // Returns the enum value (number)
  is_active: ProductStatus;

  @Expose()
  description: string;

  @Expose()
  defaultImage: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}