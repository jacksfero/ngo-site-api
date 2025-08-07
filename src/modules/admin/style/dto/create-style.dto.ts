import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateStyleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}