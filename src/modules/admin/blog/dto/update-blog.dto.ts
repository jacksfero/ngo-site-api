import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional,IsString } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {

   @IsOptional()
@IsString()
titleImage?: string;

}
