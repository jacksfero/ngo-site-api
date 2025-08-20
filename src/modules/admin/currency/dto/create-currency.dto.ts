import {IsNotEmpty,IsNumber,Min,Max,IsDecimal, IsAlphanumeric,IsString, IsOptional, IsBoolean, Length, IsAlpha } from 'class-validator';

export class CreateCurrencyDto {
  
  @IsNotEmpty()
  @IsString() 
  @Length(3, 3, { message: 'Currency must be 3 characters' })
  currency: string;

  @IsOptional()  
  icon?: string;

  
  @Length(2, 5,{ message: 'Currency Code must be between 2 and 5 characters long' })
  @IsString()
  @IsNotEmpty()
  code: string;
  
  
  @IsOptional()
  @IsNumber()
@Min(1, { message: 'Currency Value must be at least 1' }) // Minimum numeric value
@Max(999999999999, { message: 'Currency Value must not exceed 12 digits' }) // Maximum 10 digits 
  value: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
