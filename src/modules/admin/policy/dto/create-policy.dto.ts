import { IsNotEmpty, IsString, Length } from 'class-validator';

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
}
