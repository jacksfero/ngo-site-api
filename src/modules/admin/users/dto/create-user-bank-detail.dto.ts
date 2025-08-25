import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankDetailDto {
  @IsString()
  accountHolderName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  ifscCode: string;

  @IsString()
  bankName: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}


