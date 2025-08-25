// dto/create-user-address.dto.ts
import { IsEnum,IsOptional,IsNumber, IsNotEmpty, IsString, Length } from 'class-validator';
import { AddressType } from 'src/shared/entities/users-address.entity';

export class CreateUserAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  // @IsOptional()
  // @IsNumber()
  // id?: number;


  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  @Length(4, 10)
  pin: string;

  @IsString()
  aadhar: string;

  @IsString()
  contact: string;

  @IsString()
  GSTIN: string;

  @IsString()
  tradeName: string;

  @IsOptional()
  isDefault?: boolean;
}
