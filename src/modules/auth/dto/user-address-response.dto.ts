// dto/user-address-response.dto.ts
import { AddressType } from "src/shared/entities/users-address.entity";

export class UserAddressResponseDto {
  id: number;
  type: AddressType;
   name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  isDefault: boolean;
   phonecode: string;  phonecode_other: string;
  contact: string;
  pan_gstin: string;
  trade_name: string;
  other_phone: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    
  };
}
