import {Length, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateStyleDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 30,{ message: 'Style must be 3 characters' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}