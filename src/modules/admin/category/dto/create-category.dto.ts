import { IsString,IsOptional,IsBoolean,Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

 @IsOptional()
   @IsString()
   @Length(3, 50)
   slug?: string;

   @IsOptional()
  @IsBoolean()
  status?: boolean;
}
