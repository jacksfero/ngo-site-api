import { IsString, Length } from 'class-validator';

export class CreateSubjectDto {
  @Length(3, 30)
  @IsString()
  subject: string;

  @IsString()
  description: string;
}
