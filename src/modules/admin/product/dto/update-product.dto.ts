import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    // @IsOptional()
    // @IsArray()
    // @IsNumber({}, { each: true })
    // subjectsIds?: number[];
  
    // @IsOptional()
    // @IsArray()
    // @IsNumber({}, { each: true })
    // stylesIds?: number[];
}
