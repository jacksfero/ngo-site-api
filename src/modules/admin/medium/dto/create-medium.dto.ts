import { IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateMediumDto {
  @Length(5, 20)
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
