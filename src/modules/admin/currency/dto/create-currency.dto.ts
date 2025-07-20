import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateCurrencyDto {
  @Length(2, 5)
  @IsString()
  currency: string;

  @Length(2, 5)
  @IsString()
  icon: string;

  
  @Length(2, 10)
  @IsString()
  code: string;
  
  
  @Length(2, 10)
  @IsString()
  value: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
