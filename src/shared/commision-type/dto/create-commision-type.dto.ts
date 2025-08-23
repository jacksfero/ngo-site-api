// dto/create-commission-type.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCommissionTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  percentage: number;
}

 