import { IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateMediumDto {
  @Length(3, 30)
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
