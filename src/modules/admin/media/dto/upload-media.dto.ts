import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;
}
