import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateStyleDto {
  @Length(3, 50)
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
