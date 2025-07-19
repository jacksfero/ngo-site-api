import { IsNotEmpty, IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreatePolicyDto {
  @Length(5, 100)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  policyDetails: string;

  @IsNotEmpty()
  @IsString()
  remarks: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
