// dto/start-verification.dto.ts
import { IsEmail, IsEnum,IsMobilePhone } from 'class-validator';



export enum UserType {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ARTISTS = 'artists',
  // Add as needed
}




export class StartEmailVerificationDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}

export class StartMobileVerificationDto {
  @IsMobilePhone() // or @IsMobilePhone('en-IN')
  mobile: string;

  @IsEnum(UserType)
  userType: UserType;
}
