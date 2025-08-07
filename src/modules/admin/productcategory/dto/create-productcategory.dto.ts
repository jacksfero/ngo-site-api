
import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductcategoryDto {
    @Length(3, 20,{message:'Category must be 3 character'})
      @IsString()
      name: string;
    
     @IsOptional()
      @IsBoolean()
      status?: boolean;
}
