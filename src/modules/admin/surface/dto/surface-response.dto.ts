import { Expose } from 'class-transformer';

export class SurfaceResponseDto {
  @Expose()
  id: number;

  @Expose()
  surfaceName: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}