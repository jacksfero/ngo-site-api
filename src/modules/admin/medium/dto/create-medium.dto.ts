import { IsNotEmpty, IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateMediumDto {
  @Length(3, 30,{ message: 'Medium must be 3 characters' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
