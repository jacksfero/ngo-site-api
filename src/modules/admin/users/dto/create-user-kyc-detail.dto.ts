import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateKycDetailDto {
  @IsString()
  aadhar: string;

  @IsString()
  pan_gstin: string;

  @IsString()
  trade_name: string;
 
}

import { PartialType } from '@nestjs/mapped-types';
 
export class UpdateKycDetailDto extends PartialType(CreateKycDetailDto) {}
