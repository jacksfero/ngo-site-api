import { Expose } from 'class-transformer';

export class MediumResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}