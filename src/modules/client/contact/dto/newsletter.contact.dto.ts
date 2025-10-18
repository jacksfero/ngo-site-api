import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';

export class CreateNewsletterDto {
 
 
  @IsEmail()
  email: string;
 

  @IsEnum(ContactUsType)
  type: ContactUsType;

 
}
