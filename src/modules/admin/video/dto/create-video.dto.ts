import { IsBoolean,IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
 @IsNumber()
  user_id: number;
  
@IsString()
videoUrl:string

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
