import { IsEnum,IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, isNotEmpty } from 'class-validator';
//import { InventoryStatus } from 'src/shared/entities/inventory.entity';
import {  AartworkGstSlot, ShippingGstSlot } from '../../shipping/enums/gst.enum';
 

export class CreateInventoryDto {
  @IsNotEmpty()
  productId: number;
 
  @IsOptional()
  @IsDateString()
  endDate?: string;

 /* @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;*/

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discount?: number;  
  
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsEnum(AartworkGstSlot)
  gstSlot: keyof typeof AartworkGstSlot;

  @IsNotEmpty()
  shippingId: number;

  @IsOptional()
  @IsEnum(ShippingGstSlot)
  shippingSlot:keyof typeof ShippingGstSlot;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;
}
