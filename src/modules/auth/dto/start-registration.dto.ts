import { IsNotEmpty, IsString,IsEmail, IsOptional, IsEnum } from 'class-validator';

export class StartRegistrationDto {
   @IsEnum(['email', 'mobile'])
  type: 'email' | 'mobile';

  @IsString()
  identifier: string;

  @IsString()
  userType: string;
}

/*
{
  "identifier": "someone@example.com",  // or mobile number
  "type": "email",                      // or "mobile"
  "userType": "artist"                  // optional
}

*/