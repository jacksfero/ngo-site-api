import { IsString, Length, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubjectDto {
  @Length(3, 30, { message: 'Subject code must be 3 characters' })
  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
