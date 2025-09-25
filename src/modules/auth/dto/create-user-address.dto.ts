// dto/create-user-address.dto.ts
import { IsEnum,IsOptional,IsNumber, IsNotEmpty, IsString, Length } from 'class-validator';
import { AddressType } from 'src/shared/entities/users-address.entity';

export class CreateUserAddressDto {
  @IsEnum(AddressType)
  type: AddressType;
 
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
  contact: string;
 
  @IsOptional()
  @IsString()
  other_phone?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  isDefault?: boolean;
}
