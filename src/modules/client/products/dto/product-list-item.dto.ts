
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ArtistDto } from 'src/modules/auth/dto/artist.dto';
import { ImageDto } from './product-image.dto';
import { ProductStatus } from 'src/shared/entities/product.entity';
import { CategoryDto } from '../../invent-product/dto/invent-prod-list.dto';
import { InventoryDto, MediumDto, SurfaceDto } from '../../invent-product/dto/invent-product-detail-response.dto';


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

 

@Exclude()
export class ExhiProductListItemDto {
  @Expose()
  id: number;

 @Expose()
  productTitle: string;
  
  @Expose()
  slug: string;

  @Expose()
    @IsEnum(ProductStatus, { each: true }) // validate against enum
    is_active: ProductStatus;
  
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
     @Type(() => InventoryDto)
     productInventory: InventoryDto[];
    
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


    @Expose()
  finalDiscountAmount: number; // actual discount amount applied

  @Expose()
  displayPrice: number; // final price shown after discount + gst + shipping

  @Expose()
  currency: string; // INR, USD, etc.
}