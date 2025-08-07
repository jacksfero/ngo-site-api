import { Expose } from 'class-transformer';

export class BlogcategoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}