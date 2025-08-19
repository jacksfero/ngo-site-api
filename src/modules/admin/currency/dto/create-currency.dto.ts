import {IsNotEmpty,IsNumber,Min,Max,IsDecimal, IsAlphanumeric,IsString, IsOptional, IsBoolean, Length, IsAlpha } from 'class-validator';

export class CreateCurrencyDto {
  
  @IsNotEmpty()
  @IsString() 
  @Length(3, 5, { message: 'Currency  must be 3 characters' })
  currency: string;

  @IsOptional()  
  icon?: string;

  
  @Length(2, 5, { message: 'Currency code must be 2 characters' })
  @IsString()
  @IsNotEmpty()
  @IsAlpha()
  code: string;
  
  
  @IsOptional()
  @IsNumber()
@Min(1, { message: 'Value must be at least 1' }) // Minimum numeric value
@Max(999999, { message: 'Value must not exceed 6 digits' }) // Maximum 10 digits 
  value: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
