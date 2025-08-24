import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSizeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
