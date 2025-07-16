import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateContentDto {
  @Length(5, 100)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  contents: string;

  @IsNotEmpty()
  @IsString()
  remarks: string;
}
