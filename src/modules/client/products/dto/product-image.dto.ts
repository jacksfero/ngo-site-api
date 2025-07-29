import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ImageDto {
  @Expose()
  imagePath: string;
}
