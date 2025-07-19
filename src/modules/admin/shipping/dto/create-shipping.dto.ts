import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateShippingDto {
  @Length(5, 30)
  @IsString()
  weightSlot: string;

  @IsOptional()
  costINR?: number;


  @IsOptional()
  CostOthers?: number


  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
