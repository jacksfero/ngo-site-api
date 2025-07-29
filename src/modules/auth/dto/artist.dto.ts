import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ArtistDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}