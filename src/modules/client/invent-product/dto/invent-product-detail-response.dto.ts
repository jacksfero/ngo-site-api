// dto/product-detail-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ProductStatus } from 'src/shared/entities/product.entity';
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
  termsAndConditions: string;

  @Expose()
  shippingSlot: number;

  /** ✅ New computed fields for display */
 
  // @Expose()
  // finaldiscountamount: number; // actual discount amount applied

  // @Expose()
  // displayPrice: number; // final price shown after discount + gst + shipping

  // @Expose()
  // currency: string; // INR, USD, etc.
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
export class SurfaceDto {
  @Expose()
  id: number;

  @Expose()
  surfaceName: string;
}
export class MediumDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class PackingModeDto {
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
  @IsEnum(ProductStatus, { each: true }) // validate against enum
  is_active: ProductStatus;

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
  @Type(() => SurfaceDto)
  surface: SurfaceDto;

  @Expose()
  @Type(() => MediumDto)
  medium: MediumDto;

  @Expose()
  @Type(() => PackingModeDto)
  packingMode: PackingModeDto;

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
