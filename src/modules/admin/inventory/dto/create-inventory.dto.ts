import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { InventoryStatus } from 'src/shared/entities/inventory.entity';
 

export class CreateInventoryDto {
  @IsNotEmpty()
  productId: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  gstSlot?: string;

  @IsOptional()
  @IsString()
  shippingWeight?: string;

  @IsOptional()
  @IsString()
  shippingSlot?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;
}
