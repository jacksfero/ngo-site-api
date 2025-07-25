 

import { IsString, IsEmail, IsOptional, IsNumber, IsDecimal, IsEnum, Matches } from 'class-validator';
import { ContactUsType } from '../enums/contact-us-type.enum';
 

export class CreateContactUsDto {
  @IsString()
  name: string;

  @Matches(/^\+\d{1,4}$/) // e.g. +91
  @IsString()
  phonecode: string;

  @Matches(/^\d{6,15}$/) // typical mobile number pattern
  @IsString()
  mobile: string;

  @IsEmail()
  email: string;

  @IsString()
  message: string;

@IsEnum(ContactUsType)
type: ContactUsType;


  @IsString()
  subject: string;

 

@IsOptional()
@IsNumber()
productId: number;

 
}
