import { IsString,IsNotEmpty, Length, IsBoolean, IsOptional } from 'class-validator';

export class CreateSurfaceDto {
 
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  surfaceName: string;

 @IsOptional()
  @IsBoolean()
  status?: boolean;
}
