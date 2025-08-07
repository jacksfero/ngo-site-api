import { Expose } from 'class-transformer';

export class StyleResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}