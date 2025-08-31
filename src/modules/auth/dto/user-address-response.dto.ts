// dto/user-address-response.dto.ts
import { AddressType } from "src/shared/entities/users-address.entity";

export class UserAddressResponseDto {
  id: number;
  type: AddressType;
  address: string;
  city: string;
  state: string;
  country: string;
  pin: string;
 // aadhar: string;
  contact: string;
  //GSTIN: string;
  other_phone: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    
  };
}
