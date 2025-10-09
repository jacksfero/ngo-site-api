import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';

export class CreateContactUsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phonecode: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(ContactUsType)
  type: ContactUsType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  productId?: number;
}
