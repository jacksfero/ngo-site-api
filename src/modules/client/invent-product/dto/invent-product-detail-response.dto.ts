// dto/product-detail-response.dto.ts
import { Expose, Type } from 'class-transformer';
export class InventoryDto {
    @Expose()
    id: number;
  
    @Expose()
    discount: number;
  
    @Expose()
    price: number;

    @Expose()
    gstSlot: number;

    @Expose()
    shippingSlot: number;
  }

  export class ArtistDto {
    @Expose()
    id: number;
  
    @Expose()
    username: string;  // or artistName, depending on your entity
    
  }

export class ImageDto {
    @Expose()
    id: number;
  
    @Expose()
    imagePath: string;
 
  }
   export class SizeDto {
    @Expose()
    id: number;
  
    @Expose()
    name: string;
  }
  
  export class CategoryDto {
    @Expose()
    id: number;
  
    @Expose()
    name: string;
  }

export class InventProductDetailResponseDto {
  @Expose()
  id: number;

  @Expose()
  productTitle: string; 
  
  @Expose()
  defaultImage: string;
  
  
  @Expose()
  printing_rights: boolean;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  price_on_demand: boolean;
  
  @Expose()
  weight: string;

  @Expose()
  width: string;

  @Expose()
  height: string;

  @Expose()
  depth: string;

@Expose()
created_in: string;
@Expose()
original_painting: boolean;

@Expose()
negotiable: boolean;
@Expose()
refundable: boolean;
@Expose()
certificate: boolean;
@Expose()
conditions: string;


  @Expose()
  @Type(() => SizeDto)
  size: SizeDto;


  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @Expose()
  @Type(() => ArtistDto)
  artist: ArtistDto;

  // @Expose()
  // images: any[]; // TODO: replace with ImageDto if you have one

  @Expose()
  @Type(() => InventoryDto)
  inventories: InventoryDto[];

  @Expose()
  @Type(() => ImageDto)
  images: ImageDto[];
}
