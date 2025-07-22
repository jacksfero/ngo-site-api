import { IsString,IsOptional,Length } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

   @IsOptional()
   @IsString()
   @Length(3, 50)
   slug?: string;
}