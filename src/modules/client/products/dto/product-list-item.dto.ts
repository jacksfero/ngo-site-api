
import { Exclude, Expose, Type } from 'class-transformer';
import { ArtistDto } from 'src/modules/auth/dto/artist.dto';
import { ImageDto } from './product-image.dto';
import { CategoryDto } from '../../invent-product/dto/invent-prod-list.dto';
import { MediumDto, SurfaceDto } from '../../invent-product/dto/invent-product-detail-response.dto';


@Exclude()
export class ProductListItemDto {
  @Expose()
  id: number;

 @Expose()
  productTitle: string;
  
  @Expose()
  slug: string;
  
  @Expose()
  artist_price: number;

  @Expose()
  price_on_demand: number;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  depth: number;

  @Expose()
  weight: number;
  
   @Expose()
  defaultImage: string|null;
  
   @Expose()
  createdAt: Date;
 
  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;
    
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

  @Expose()
  @Type(() => SurfaceDto)
  surface: SurfaceDto; 
  
  @Expose()
  @Type(() => MediumDto)
  medium: MediumDto;
}
