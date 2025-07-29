
import { Exclude, Expose, Type } from 'class-transformer';
import { ArtistDto } from 'src/modules/auth/dto/artist.dto';
import { ImageDto } from './product-image.dto';

@Exclude()
export class ProductListItemDto {
  @Expose()
  id: number;

 @Expose()
  productTitle: string;
  
  
  @Expose()
  artist_price: number;
  
   @Expose()
  defaultImage: string|null;
  
   @Expose()
  createdAt: Date;

   @Expose()
  category?: {
    id: number;
    name: string;
  };

   

   @Expose()
  owner?: {
    id: number;
    username: string;
  };

   @Expose()
  @Type(() => ImageDto)
  images: ImageDto[];

   @Expose()
  @Type(() => ArtistDto)
  artist: ArtistDto;


}
