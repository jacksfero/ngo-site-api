import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';

export class CreateSurfaceDto {
  @Length(5, 20)
  @IsString()
  surfaceName: string;

 @IsOptional()
  @IsBoolean()
  status?: boolean;
}
