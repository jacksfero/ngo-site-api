import { IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoDto } from './create-video.dto';


export class UpdateVideoDto extends PartialType(CreateVideoDto) {

    @IsOptional()
@IsNumber()
user_id?: number;

}
