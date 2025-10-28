import { Expose } from 'class-transformer';

export class StyleResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

    @Expose()
   description: string;
 
}
export class SurfaceResponseDto {
  @Expose()
  id: number;

  @Expose()
  surfaceName: string;
 
}
export class MediumResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
 
}
export class SubjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  subject: string;

    @Expose()
    description: string;
}