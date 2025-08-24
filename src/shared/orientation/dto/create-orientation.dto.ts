
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateOrientationDto  {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
