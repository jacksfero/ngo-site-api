import { Expose } from 'class-transformer';

export class ProductcategoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}