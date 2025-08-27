import { 
  IsArray, IsNumber,
  IsBoolean, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MaxLength 
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  productTitle: string;

  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  description: string;

  // ✅ Optional owner & artist IDs (for Admin usage)
  @IsOptional()
  @IsInt()
  owner_id?: number;

  @IsOptional()
  @IsInt()
  artist_id?: number;

  @IsOptional()
  @IsInt()
  artist_price?: number;

  @IsOptional()
  @IsInt()
  size_id?: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsOptional()
  @IsInt()
  medium_id?: number;

  @IsOptional()
  @IsInt()
  surface_id?: number;

  @IsOptional()
  @IsInt()
  orientation_id?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  depth?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsOptional()
  @IsInt()
  commissionTypeId?: number;

  @IsOptional()
  @IsInt()
  packingModeId?: number;
 
  @IsOptional()
  @IsInt()
  shippingTimeId?: number;
 
  @IsOptional()
  @IsInt()
  created_in?: number;

  @IsOptional() 
  @IsString()
  tags?: string;

  // ✅ Boolean Flags
  @IsOptional()
  @IsBoolean()
  original_painting?: boolean;

  @IsOptional()
  @IsBoolean()
  new_arrival?: boolean;

  @IsOptional()
  @IsBoolean()
  eliteChoice?: boolean;

  @IsOptional()
  @IsBoolean()
  affordable_art?: boolean;

  @IsOptional()
  @IsBoolean()
  price_on_demand?: boolean;

  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @IsOptional()
  @IsBoolean()
  printing_rights?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  refundable?: boolean;

  @IsOptional()
  @IsBoolean()
  certificate?: boolean;

  @IsOptional()
  @IsBoolean()
  is_lock?: boolean;

  /*@IsOptional()
  @IsBoolean()
  inventory?: boolean;*/

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  remark_to_indigalleria?: string;

  @IsOptional()
  @IsString()
  remark_to_artist?: string;

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsString()
  defaultImage?: string;

  @IsArray()
  @IsOptional()
  subjectsIds?: number[];


  @IsArray()
  @IsOptional()
  stylesIds?: number[];
}
