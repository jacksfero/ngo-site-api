import { IsString, Length } from 'class-validator';

export class CreateStyleDto {
  @Length(5, 100)
  @IsString()
  title: string;

  @IsString()
  description: string;
}
