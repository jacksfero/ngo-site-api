
import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductcategoryDto {
    @Length(5, 20)
      @IsString()
      name: string;
    
     @IsOptional()
      @IsBoolean()
      status?: boolean;
}
