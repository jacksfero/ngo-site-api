import {IsNotEmpty,IsDecimal, IsAlphanumeric,IsString, IsOptional, IsBoolean, Length, IsAlpha } from 'class-validator';

export class CreateCurrencyDto {
  
  @IsNotEmpty()
  @IsString() 
  @Length(2, 5, { message: 'Currency   must be 2 characters' })
  currency: string;

  @Length(1, 5, { message: 'Currency Icon must be 1 characters' })
  @IsString()   
  icon: string;

  
  @Length(2, 5, { message: 'Currency code must be 2 characters' })
  @IsString()
  @IsNotEmpty()
  @IsAlpha()
  code: string;
  
  @IsDecimal()
  @IsOptional()
  @Length(2, 10, { message: 'Currency value must be 2 characters' })
  @IsString()  
  value: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
